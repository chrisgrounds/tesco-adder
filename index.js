const { Builder, By, Key, until } = require("selenium-webdriver");
const { Options } = require('selenium-webdriver/chrome');
const { items } = require("./items.json");
const { email, password } = require("./credentials.json");
const chalk = require('chalk');

const options = new Options();
options.setUserPreferences({ "User-Agent": "chrisgrounds" });

const TESCO_URL = "https://www.tesco.com";
const GROCERIES_URI = "groceries/en-GB/products";
const LOGIN_URI = "account/login/en-GB?from=https%3A%2F%2Fwww.tesco.com";

(async function example() {
  let driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();

  const findById = (id) => driver.findElement(By.id(id));
  const findByClassName = (className) => driver.findElement(By.className(className));

  const addGroceryToShoppingBasket = async (id) => {
    await driver.get(`${TESCO_URL}/${GROCERIES_URI}/${id}`);

    await (await findByClassName('add-control')).click();
    const basketFeedback = await driver.findElement(By.css("[data-auto='basket-feedback']"));
    await driver.wait(until.elementIsVisible(basketFeedback), 60000);
  }

  const login = async () => {
    await driver.get(`${TESCO_URL}/${LOGIN_URI}`);

    await (await findByClassName("beans-cookies-notification__button")).click();

    const emailInput = await findById('email');
    const passwordInput = await findById('password');

    await emailInput.sendKeys(email);
    await passwordInput.sendKeys(password);

    await (await findById("signin-button")).click();
  }

  const assertOnHomePage = async () => {
    await driver.wait(until.urlIs(`${TESCO_URL}/`), 60000);
  }

  try {
    console.log(`${chalk.blue('Logging in...')}`);
    await login();
    console.log(`${chalk.green('logged in! ✅')}`);

    console.log(`${chalk.blue('Checking homepage...')}`);
    await assertOnHomePage();
    console.log(`${chalk.green('Checked homepage! ✅')}`);

    console.log(`${chalk.blue('Adding items to cart...')}`);
    for (let item of items) {
      await addGroceryToShoppingBasket(item);
      console.log(`${chalk.blue(`Added ${item} to cart ✅`)}`);
    }
    console.log(`${chalk.green('Added items to cart! ✅')}`);
  } catch (e) {
    console.log(e);
  }
})();
