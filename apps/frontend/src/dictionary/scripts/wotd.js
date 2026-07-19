function initWordOfTheDay() {
  const wotdWord = document.getElementById("wotdWord");
  const wotdCategory = document.getElementById("wotdCategory");
  const wotdDefinition = document.getElementById("wotdDefinition");
  const wotdExample = document.getElementById("wotdExample");

  const ws = new WebSocket(`ws://${window.location.host}/ws`);

  ws.addEventListener("message", (event) => {
    const { type, payload } = JSON.parse(event.data);

    console.log(event.data);

    if (type === "word_of_the_day") {
      wotdWord.textContent = payload.word;
      wotdCategory.textContent = payload.category_name;
      wotdDefinition.textContent = payload.definition;
      wotdExample.textContent = payload.example_sentence;
    }
  });

  ws.addEventListener("close", () => {
    console.log("WebSocket disconnected");
  });

  return ws;
}

export { initWordOfTheDay };
