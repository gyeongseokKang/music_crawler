const puppeteer = require("puppeteer");
const fs = require("fs");

(async () => {
  const start = 0;
  const end = 1;
  const onlyMeta = false;
  const targetPageUrl = "https://www.epidemicsound.com/music/themes/wedding-romance/antivalentines/";
  const targetMetaFileName = "genresChildren2";
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
  await sleep(5000);

  await page.goto(targetPageUrl);
  //   await page.goto("https://www.epidemicsound.com/music/genres/comedy/?bpm=0%2C140&vocals=false");

  await sleep(5000);

  console.time();

  const metaList = [];
  let list = new Array(end);

  for (let i = 0; i < list.length; i++) {
    list[i] = i;
  }
  for (let number of list) {
    const targetMeta = await page.evaluate(
      async (number, start, onlyMeta) => {
        console.log(number, start, onlyMeta);
        let meta;
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

        console.log(number, "번째 다운로드 진행중");
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
        await sleep(100);
        if (start > number) {
          console.log(number, "번째 다운로드 실패 - start보다 낮음");
          return;
        }

        if (onlyMeta) {
          const metaEl = document.querySelectorAll(`div[data-index="${number}"] [data-testid="track-row"]>div`);
          const title = metaEl[0]?.querySelectorAll("a")?.[0]?.innerText;
          const realArtist = metaEl[0]?.querySelector(`a[href*="/artists/"`)?.innerText;
          let linkArtist = metaEl[0]
            ?.querySelector(`a[href*="/artists/"`)
            ?.href?.split("/artists/")?.[1]
            ?.split("/")?.[0]
            ?.replaceAll("-", " ")
            ?.split(" ");

          for (let i = 0; i < linkArtist.length; i++) {
            linkArtist[i] = linkArtist[i].charAt(0).toUpperCase() + linkArtist[i].slice(1);
          }
          const displayArtist = linkArtist.join(" ");

          const duration = metaEl[3]?.querySelectorAll("span")?.[0]?.innerText;
          const bpm = metaEl[3]?.querySelectorAll("span")?.[1]?.innerText;
          const genres = Array.from(metaEl[4]?.querySelectorAll('a[href*="music/genres"]') || [])?.map(
            (item) => item?.innerText
          );
          const moods = Array.from(metaEl[4]?.querySelectorAll('a[href*="music/moods"]') || [])?.map(
            (item) => item?.innerText
          );

          meta = {
            fileName: `ES_${title} - ${displayArtist}.wav`,
            title: title,
            realArtist: realArtist,
            displayArtist: displayArtist,
            duration: duration,
            bpm: bpm,
            genres: genres,
            moods: moods,
          };

          console.log(meta);

          return meta;
        }
        await targetEl.click();
        await sleep(500);

        Array.from(document.querySelectorAll(`div[role="dialog"] button p`))
          .filter((span) => {
            return span.innerText.toUpperCase().includes("MP3");
          })
          .forEach((element) => {
            if (element) {
              console.log("mp3", element);
              element.click();
            }
          });

        await sleep(500);

        Array.from(document.querySelectorAll(`div ul li[role="option"]`))
          .filter((span) => {
            return span.innerText.toUpperCase().includes("WAV");
          })
          .forEach((element) => {
            if (element) element.click();
          });

        await sleep(500);

        Array.from(document.querySelectorAll(`div[role="dialog"] button span`))
          .filter((span) => {
            return span.innerText === "Download";
          })
          .forEach((element) => {
            if (element) {
              const metaEl = document.querySelectorAll(`div[data-index="${number}"] [data-testid="track-row"]>div`);
              const title = metaEl[0]?.querySelectorAll("a")?.[0]?.innerText;
              const realArtist = metaEl[0]?.querySelector(`a[href*="/artists/"`)?.innerText;
              let linkArtist = metaEl[0]
                ?.querySelector(`a[href*="/artists/"`)
                ?.href?.split("/artists/")?.[1]
                ?.split("/")?.[0]
                ?.replaceAll("-", " ")
                ?.split(" ");

              for (let i = 0; i < linkArtist.length; i++) {
                linkArtist[i] = linkArtist[i].charAt(0).toUpperCase() + linkArtist[i].slice(1);
              }
              const displayArtist = linkArtist.join(" ");

              const duration = metaEl[3]?.querySelectorAll("span")?.[0]?.innerText;
              const bpm = metaEl[3]?.querySelectorAll("span")?.[1]?.innerText;
              const genres = Array.from(metaEl[4]?.querySelectorAll('a[href*="music/genres"]') || [])?.map(
                (item) => item?.innerText
              );
              const moods = Array.from(metaEl[4]?.querySelectorAll('a[href*="music/moods"]') || [])?.map(
                (item) => item?.innerText
              );

              meta = {
                fileName: `ES_${title} - ${displayArtist}.wav`,
                title: title,
                realArtist: realArtist,
                displayArtist: displayArtist,
                duration: duration,
                bpm: bpm,
                genres: genres,
                moods: moods,
              };
              console.log(meta);

              element.click();
            }
          });
        await sleep(1000);
        return meta;
      },
      number,
      start,
      onlyMeta
    );
    if (targetMeta) {
      await fs.appendFileSync(`${targetMetaFileName}.json`, JSON.stringify(targetMeta) + ",");
    }
  }
  console.log(`총 ${list.length}중 ${metaList.length} 다운로드 완료`);
  console.timeEnd();
  //   await fs.appendFileSync("ES_genres_comedy2.json", JSON.stringify(...jsonMetaList));

  //   await browser.close();
})();

function sleep(m) {
  return new Promise((r) => setTimeout(r, m));
}
