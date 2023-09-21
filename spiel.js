// Variable zum laden der 4 Select Felder
let selection = `
        <select id='sel1' style="background-color: black">
            <option value="black"></option>
            <option value="blue">Blau</option>
            <option value="green">Grün</option>
            <option value="yellow">Gelb</option>
            <option value="red">Rot</option>
        </select>
         <select id='sel2' style="background-color: black">
            <option value="black"></option>
            <option value="blue">Blau</option>
            <option value="green">Grün</option>
            <option value="yellow">Gelb</option>
            <option value="red">Rot</option>
        </select>
         <select id='sel3' style="background-color: black">
            <option value="black"></option>
            <option value="blue">Blau</option>
            <option value="green">Grün</option>
            <option value="yellow">Gelb</option>
            <option value="red">Rot</option>
        </select>
         <select id='sel4' style="background-color: black">
            <option value="black"></option>
            <option value="blue">Blau</option>
            <option value="green">Grün</option>
            <option value="yellow">Gelb</option>
            <option value="red">Rot</option>
        </select>
        <br>
        <p id="correct"></p>
`;

let name;
let score = 0;

// Funktionen werden erst geladen wenn die Seite vollständig aufgebaut ist
$(document).ready(function () {
  let randomArray = [];
  let selectedArray = [null, null, null, null];

  // Zufälliger Array der zu Beginn des Spiels erzeugt wird
  $.get("/getColors", (colors) => {
    colors.forEach((element) => {
      randomArray.push(element);
    });
  });

  // Button der das Spiel zurücksetzt und einen neuen Farb-Array erzeugt
  $(document).on("click", "#reset", () => {
    $("#table").empty();
    $("#correct").fadeOut();
    $("select").show();
    $("#highscore").remove();
    $("#hiScButton").remove();
    $("select").css("background-color", "black");
    selectedArray = [null, null, null, null];
    score = 0;
    $("select").val("black");
    console.log(randomArray);
    $.get("/getColors", (colors) => {
      colors.forEach((element, index) => {
        randomArray[index] = element;
      });
      console.log(randomArray);
    });
  });

  // Funktion zur
  $(document).on("change", "select", function () {
    let selectedValue = $(this).val();
    $(this).css("background-color", selectedValue);
    let selectId = $(this).attr("id");
    let index = selectId.substring(3) - 1;
    selectedArray[index] = selectedValue;
    for (let i = 0; i < selectedArray.length; i++) {
      // Vergleiche die Felder auf Vollständigkeit
      if (selectedArray[i] === null || selectedArray[i] === "black") break;
      if (i === 3) {
        let counter = 0;
        for (let j = 0; j < selectedArray.length; j++) {
          if (selectedArray[j] === randomArray[j]) counter++;
          // Wenn alle Felder gesetzt sind aber nicht korrekt sind.
          if (counter < 4 && j === 3) {
            $("#table").append(
              `<tr><td style="background-color: ${selectedArray[0]};"></td><td style="background-color: ${selectedArray[1]};"></td><td style="background-color: ${selectedArray[2]};"></td><td style="background-color: ${selectedArray[3]};"></td></tr>`
            );
            $("#correct").show();
            $("#correct").text(`${counter} Richtige Felder`);
            selectedArray = [null, null, null, null];
            $("select").val("black");
            $("select").css("background-color", "black");
            score++;
            console.log(randomArray);
          }

          // Wenn alle Felder ausgewählt und alle Werte korrekt sind
          if (counter === 4) {
            score++;
            $.post("/score", { name: name, highscore: score })
              .done(() => {
                console.log("Score wurde erfolgreich uebertragen.");
              })
              .fail(() => {
                console.log("Score konnte nicht uebertragen werden!");
              });
            $("#correct").show();
            $("#correct").text(`Korrekt! Du hast ${score} Versuche gebraucht.`);
            $("select").fadeOut();
            $("#brett").append(
              `<input type='button' id="hiScButton" value="View Highscore">`
            );
            $("#hiScButton").on("click", () => {
              $("#table").empty();
              $("#brett").append(`<div id="highscore"></div>`);
              $.get("/highscore", (data) => {
                let highscore = `
                                    <h1>Highscore</h1>
                                    <table id="hiScTable">`;
                data.forEach((element) => {
                  highscore += `<tr><td>${element.name}</td><td>${element.highscore}</td></tr>`;
                });
                highscore += `</table>`;
                $("#highscore").append(highscore);
                $("#hiScButton").remove();
              });
            });
          }
        }
      }
    }
  });

  // Funktion zur Weiterleitung zum Spiel
  $("#login").on("submit", function (e) {
    e.preventDefault();
    $("#login").fadeToggle(500);
    name = $(this).serialize().split("=")[1];
    $("#header").text(`Viel Glück ${name}`);
    setTimeout(function () {
      $("#brett").append(selection);
      $("#brett").append(
        '<input type="button" value="Reset Game" id="reset"/>\n'
      );
    }, 500);
  });
});
