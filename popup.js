chrome.runtime.onMessage.addListener(async function (request, sender) {
  if (request.action == "getSource") {
    this.pageSource = request.source;
    var scores = this.pageSource.match(
      /<span class="comment">[0-9]*.[0-9]*\/[0-9]*.[0-9]*/
    );
    let i = 1;
    let finalScore = new Decimal(0);
    for (const score of scores) {
      const score_split = score
        .split("/")[0]
        .replace(`<span class="comment">`, "");
      document.getElementById(
        "content"
      ).innerHTML += `<p class="text">Found ${i} score: ${score_split}</p>`;
      finalScore = finalScore.add(new Decimal(score_split));
      i++;
    }
    document.getElementById(
      "content"
    ).innerHTML += `<p class="final">Final score: ${finalScore.toNumber()}</p>`;
    copyTextToClipboard(finalScore.toNumber());

  // TODO: send message to content.js
    // chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    //   chrome.tabs.sendMessage(tabs[0].id, {type:"getText"});
    // });
  }
});

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  chrome.tabs.executeScript(tabs[0].id, {
    code: 'var s = document.documentElement.outerHTML; chrome.runtime.sendMessage({action: "getSource", source: s});',
  });
});

function copyTextToClipboard(text) {
  //Create a textbox field where we can insert text to.
  var copyFrom = document.createElement("textarea");

  //Set the text content to be the text you wished to copy.
  copyFrom.textContent = text;

  //Append the textbox field into the body as a child.
  //"execCommand()" only works when there exists selected text, and the text is inside
  //document.body (meaning the text is part of a valid rendered HTML element).
  document.body.appendChild(copyFrom);

  //Select all the text!
  copyFrom.select();

  //Execute command
  document.execCommand("copy");

  //(Optional) De-select the text using blur().
  copyFrom.blur();

  //Remove the textbox field from the document.body, so no other JavaScript nor
  //other elements can get access to this.
  document.body.removeChild(copyFrom);
}
