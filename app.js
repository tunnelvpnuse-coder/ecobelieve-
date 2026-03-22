const navButtons = document.querySelectorAll(".nav-btn");
const screens = document.querySelectorAll(".screen");
const output = document.getElementById("mimiOutput");
const commandInput = document.getElementById("mimiInput");
const runButton = document.getElementById("runCommand");
const dataSaverToggle = document.getElementById("dataSaverToggle");

let dataSaver = false;

function setScreen(targetId) {
  screens.forEach((screen) => {
    screen.classList.toggle("active", screen.id === targetId);
  });
  navButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.target === targetId);
  });
}

function runMimiCommand(rawCommand) {
  const command = rawCommand.trim().toLowerCase();
  if (!command) {
    output.textContent = "Please type a command for Mimi.";
    return;
  }

  if (command.includes("start") && command.includes("live")) {
    setScreen("live");
    output.textContent =
      "Mimi: Livestream setup opened. I can enable anime mode, set language, and pin products.";
    return;
  }

  if (command.includes("wallet") || command.includes("earnings")) {
    setScreen("wallet");
    output.textContent =
      "Mimi: Wallet dashboard opened with earnings by gifts, commerce, and learning.";
    return;
  }

  if (command.includes("course") || command.includes("learn")) {
    setScreen("learn");
    output.textContent =
      "Mimi: Learning Hub opened. I can suggest skill tracks based on your goals.";
    return;
  }

  if (command.includes("product") || command.includes("store") || command.includes("market")) {
    setScreen("market");
    output.textContent =
      "Mimi: Marketplace opened. I can help create listings and optimize pricing by region.";
    return;
  }

  if (command.includes("summary") || command.includes("day")) {
    setScreen("home");
    output.textContent =
      "Mimi: End-of-day summary ready. Today: +4.2% followers, $242 net earnings, 3 clip suggestions.";
    return;
  }

  output.textContent =
    "Mimi: I understood the request at a high level. Try commands with keywords like live, wallet, market, or learn.";
}

navButtons.forEach((button) => {
  button.addEventListener("click", () => setScreen(button.dataset.target));
});

runButton.addEventListener("click", () => runMimiCommand(commandInput.value));

commandInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    runMimiCommand(commandInput.value);
  }
});

dataSaverToggle.addEventListener("click", () => {
  dataSaver = !dataSaver;
  dataSaverToggle.textContent = `Data Saver: ${dataSaver ? "ON" : "OFF"}`;
  output.textContent = dataSaver
    ? "Mimi: Data Saver enabled. Media now uses adaptive compression and low-bandwidth loading."
    : "Mimi: Data Saver disabled. Full-quality media delivery restored.";
});
