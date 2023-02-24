const puppeteer = require("puppeteer");
const fs = require("fs");

(async () => {
  // headless 브라우저 실행
  const browser = await puppeteer.launch({ headless: false });
  // 새로운 페이지 열기
  const page = await browser.newPage();

  await page.setViewport({
    width: 1600,
    height: 1000,
  });

  await page.goto("https://www.epidemicsound.com");

  // 쿠키 허용 체크
  if ((await page.$("#es-consent-accept-btn")) !== null) {
    await page.click("#es-consent-accept-btn");
  }

  await sleep(2000);

  // 로그인 버튼 클릭
  await page.click(`a[data-cy-login-button="true"]`);

  await sleep(5000);

  if ((await page.$("#username")) !== null) {
    await page.type("#username", "jow428@naver.com"); // <---------------------- 여기에 아이디 입력
    await sleep(1000);
    await page.type("#password", ""); // <---------------------- 여기에 아이디 입력
    await sleep(1000);
    await page.click("#kc-login");
    await sleep(2000);
  }
  await sleep(2000);

  await page.goto("https://www.epidemicsound.com/music/genres/comedy/?vocals=false");
  //   await page.goto("https://www.epidemicsound.com/music/genres/comedy/?bpm=0%2C140&vocals=false");

  await sleep(2000);

  let jsonMetaList = await page.evaluate(async () => {
    return await new Promise((resolve) => {
      const metaList = [];
      function sleep(m) {
        return new Promise((r) => setTimeout(r, m));
      }

      async function loadMoreDate() {
        const viewMoreEl = document.querySelector(
          `#mainContentContainer > main > div.css-1mqbghn > div > div > div:nth-child(2) > div > div > div:nth-child(2) > button`
        );
        if (viewMoreEl) {
          viewMoreEl.click();
        } else {
          return "fail";
        }
        await sleep(5000);
      }

      async function promiseFunction({ number, start, onlyMeta }) {
        console.log(number, "번째 다운로드 진행중");
        let meta;
        let targetEl = document.querySelector(`div[data-index="${number}"] button[aria-label="Download"]`);

        while (!targetEl) {
          window.scrollBy({ top: 99999 });
          const response = await loadMoreDate();
          if (response === "fail") {
            break;
          }
          console.log(number, "이후 데이터 불러오는중");
          const NextEl = document.querySelector(`div[data-index="${number}"] button[aria-label="Download"]`);
          if (NextEl) {
            targetEl = NextEl;
          }
        }
        if (!targetEl) {
          console.log(number, "번째 다운로드 실패 - 대상없음");
          return;
        }
        targetEl.scrollIntoView();

        if (start > number) {
          console.log(number, "번째 다운로드 실패 - start보다 낮음");
          return;
        }

        await targetEl.click();
        await sleep(500);

        Array.from(document.querySelectorAll(`div[role="dialog"] button p`))
          .filter((span) => {
            return span.innerText === "MP3"; // filter il for specific text
          })
          .forEach((element) => {
            if (element) element.click(); // click on il with specific text
          });

        await sleep(500);
        Array.from(document.querySelectorAll(`div ul li`))
          .filter((span) => {
            return span.innerText === "WAV"; // filter il for specific text
          })
          .forEach((element) => {
            if (element) element.click(); // click on il with specific text
          });
        await sleep(500);
        Array.from(document.querySelectorAll(`div[role="dialog"] button span`))
          .filter((span) => {
            return span.innerText === (!onlyMeta ? "Download" : "Cancel"); // filter il for specific text
          })
          .forEach((element) => {
            if (element) {
              const metaEl = document.querySelectorAll(`div[data-index="${number}"] [data-testid="track-row"]>div`);
              const title = metaEl[0]?.querySelectorAll("a")?.[0]?.innerText;
              const artist = metaEl[0]?.querySelectorAll("a")?.[1]?.innerText;
              const duration = metaEl[3]?.querySelectorAll("span")?.[0]?.innerText;
              const bpm = metaEl[3]?.querySelectorAll("span")?.[1]?.innerText;
              const genres = Array.from(metaEl[4]?.querySelectorAll('a[href*="music/genres"]') || [])?.map(
                (item) => item?.innerText
              );
              const moods = Array.from(metaEl[4]?.querySelectorAll('a[href*="music/moods"]') || [])?.map(
                (item) => item?.innerText
              );

              meta = {
                fileName: `ES_${title} - ${artist}.wav`,
                title: title,
                artist: artist,
                duration: duration,
                bpm: bpm,
                genres: genres,
                moods: moods,
              };
              console.log(title, artist, duration, bpm, genres, moods);

              element.click();
            }
          });
        await sleep(2000);
        return meta;
      }

      (async () => {
        console.time();
        const start = 0;
        const end = 1000;
        let list = new Array(end);

        for (let i = 0; i < list.length; i++) {
          list[i] = i;
        }
        for (let element of list) {
          const meta = await promiseFunction({
            number: element,
            start: start,
            onlyMeta: true,
          });
          if (meta) {
            metaList.push(meta);
          }
        }
        console.log(`총 ${list.length}중 ${metaList.length} 다운로드 완료`);
        console.timeEnd();
        resolve(metaList);
      })();
    });
  });

  await fs.appendFileSync("ES_genres_comedy.json", JSON.stringify(jsonMetaList));

  //   await browser.close();
})();

function sleep(m) {
  return new Promise((r) => setTimeout(r, m));
}
