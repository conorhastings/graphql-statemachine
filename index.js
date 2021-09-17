const { parse } = require("graphql");
const { createMachine } = require("xstate");
const { xstateToSvg } = require("xstate-to-svg");
const fs = require("fs");
const puppeteer = require("puppeteer"); // include lib
const clipboardy = require("clipboardy");
const query = parse(`query {
  feed {
    is_user_nta
    universal_search
    modules {
      items {
        action
        credit_clarity {
          credit_clarity_id
          offer_ari
          offer_text
          prequal_text
          loggingData
        }
        icon_url
        image_url
        logging_data
        title
      }
      layout
      logging_data
      title
      module_id
    }
  }
 }`);

function getMachine(query) {
  const machine = query.selectionSet.selections.reduce(
    (stateMachine, selection) => {
      if (selection.kind === "Field" && selection.selectionSet) {
        stateMachine.states[selection.name.value] = createMachine(
          getMachine(selection || {})
        );
        console.log(JSON.stringify(stateMachine));
      } else {
        stateMachine.states[selection.name.value] = {};
      }
      return stateMachine;
    },
    { id: "query", states: {} }
  );
  return machine;
}
const machine = `Machine(${JSON.stringify(
  getMachine(query.definitions[0]),
  null,
  4
)})`;
console.log(machine);
fs.writeFileSync("./stateMachine.js", machine);
// const svg = xstateToSvg(machine);
// const imagesDir = `${__dirname}/images`;
// fs.writeFileSync(`${imagesDir}/query.svg`, svg, {
//   encoding: "utf8",
// });
