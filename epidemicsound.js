const puppeteer = require("puppeteer");

(async () => {
  // headless 브라우저 실행
  const browser = await puppeteer.launch({ headless: false });
  // 새로운 페이지 열기
  const page = await browser.newPage();
  await page.setViewport({
    width: 1000,
    height: 1000,
  });

  await page.goto("https://www.epidemicsound.com");

  // 쿠키 허용 체크
  if ((await page.$("#es-consent-accept-btn")) !== null) {
    await page.click("#es-consent-accept-btn");
  }

  await sleep(5000);

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

  await page.goto("https://www.epidemicsound.com/music/genres/mystery");

  await sleep(3000);

  await page.evaluate(async () => {
    function sleep(m) {
      return new Promise((r) => setTimeout(r, m));
    }

    async function promiseFunction(number) {
      const targetEl = document.querySelector(`div[data-index="${number}"] button[aria-label="Download"]`);
      targetEl.scrollIntoView();
      await targetEl.click();
      await sleep(1000);
      Array.from(document.querySelectorAll(`div[role="dialog"] button span`))
        .filter((span) => {
          return span.innerText === "Download"; // filter il for specific text
        })
        .forEach((element) => {
          if (element) element.click(); // click on il with specific text
        });
      await sleep(1000);
    }
    (async () => {
      let list = new Array(20);

      for (let i = 0; i < list.length; i++) {
        list[i] = i;
      }
      for (let element of list) {
        const result = await promiseFunction(element);
        console.log(result);
      }
    })();
  });

  // 모든 스크래핑 작업을 마치고 브라우저 닫기
  //   await browser.close();
})();

function sleep(m) {
  return new Promise((r) => setTimeout(r, m));
}
