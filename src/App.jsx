import * as go from "gojs";
import { ReactDiagram } from "gojs-react";
import "./App.css";

let diagramInstance; // Global variable to store the diagram instance

function initDiagram() {
  const diagram = new go.Diagram({
    "undoManager.isEnabled": true,
    layout: new go.TreeLayout({
      angle: 90,
      path: go.TreePath.Source,
      setsPortSpot: false,
      setsChildPortSpot: false,
      arrangement: go.TreeArrangement.Horizontal,
    }),
  });

  // Function to convert visibility
  const convertVisibility = (v) => {
    switch (v) {
      case "public":
        return "+";
      case "private":
        return "-";
      case "protected":
        return "#";
      case "package":
        return "~";
      default:
        return v;
    }
  };

  // Property template
  const propertyTemplate = new go.Panel("Horizontal").add(
    new go.TextBlock({ isMultiline: false, editable: false, width: 12 }).bind(
      "text",
      "visibility",
      convertVisibility,
    ),
    new go.TextBlock({ isMultiline: false, editable: true }).bindTwoWay(
      "text",
      "name",
    ),
    new go.TextBlock("").bind("text", "type", (t) => (t ? ": " : "")),
    new go.TextBlock({ isMultiline: false, editable: false }).bindTwoWay(
      "text",
      "type",
    ),
    new go.TextBlock({ isMultiline: false, editable: false }).bind(
      "text",
      "default",
      (s) => (s ? " = " + s : ""),
    ),
  );

  // Method template
  const methodTemplate = new go.Panel("Horizontal").add(
    new go.TextBlock({ isMultiline: false, editable: false, width: 12 }).bind(
      "text",
      "visibility",
      convertVisibility,
    ),
    new go.TextBlock({ isMultiline: false, editable: true }).bindTwoWay(
      "text",
      "name",
    ),
    new go.TextBlock("()").bind("text", "parameters", (parr) => {
      let s = "(";
      for (let i = 0; i < parr.length; i++) {
        const param = parr[i];
        if (i > 0) s += ", ";
        s += param.name + ": " + param.type;
      }
      return s + ")";
    }),
    new go.TextBlock("").bind("text", "type", (t) => (t ? ": " : "")),
    new go.TextBlock({ isMultiline: false, editable: true }).bindTwoWay(
      "text",
      "type",
    ),
  );

  // Node template
  diagram.nodeTemplate = new go.Node("Auto", {
    locationSpot: go.Spot.Center,
    fromSpot: go.Spot.AllSides,
    toSpot: go.Spot.AllSides,
  }).add(
    new go.Shape({ fill: "#ffffff" }),
    new go.Panel("Table", { defaultRowSeparatorStroke: "black" }).add(
      new go.TextBlock({
        row: 0,
        columnSpan: 2,
        margin: 3,
        alignment: go.Spot.Center,
        font: "bold 12pt sans-serif",
        isMultiline: false,
        editable: true,
      }).bindTwoWay("text", "name"),
      new go.Panel("Vertical", {
        name: "PROPERTIES",
        row: 1,
        margin: 3,
        stretch: go.Stretch.Horizontal,
        defaultAlignment: go.Spot.Left,
        background: "#ffffff",
        itemTemplate: propertyTemplate,
      }).bind("itemArray", "properties"),
      new go.Panel("Vertical", {
        name: "METHODS",
        row: 2,
        margin: 3,
        stretch: go.Stretch.Horizontal,
        defaultAlignment: go.Spot.Left,
        background: "#ffffff",
        itemTemplate: methodTemplate,
      }).bind("itemArray", "methods"),
    ),
  );

  // Link templates
  const linkStyle = {
    isTreeLink: false,
    fromEndSegmentLength: 0,
    toEndSegmentLength: 0,
  };

  diagram.linkTemplate = new go.Link({ ...linkStyle, isTreeLink: true }).add(
    new go.Shape(),
    new go.Shape({ toArrow: "Triangle", fill: "white" }),
  );

  diagram.linkTemplateMap.add(
    "Association",
    new go.Link(linkStyle).add(new go.Shape()),
  );

  diagram.linkTemplateMap.add(
    "Realization",
    new go.Link(linkStyle).add(
      new go.Shape({ strokeDashArray: [3, 2] }),
      new go.Shape({ toArrow: "Triangle", fill: "white" }),
    ),
  );

  diagram.linkTemplateMap.add(
    "Dependency",
    new go.Link(linkStyle).add(
      new go.Shape({ strokeDashArray: [3, 2] }),
      new go.Shape({ toArrow: "OpenTriangle" }),
    ),
  );

  diagram.linkTemplateMap.add(
    "Composition",
    new go.Link(linkStyle).add(
      new go.Shape(),
      new go.Shape({ fromArrow: "StretchedDiamond", scale: 1.3 }),
      new go.Shape({ toArrow: "OpenTriangle" }),
    ),
  );

  diagram.linkTemplateMap.add(
    "Aggregation",
    new go.Link(linkStyle).add(
      new go.Shape(),
      new go.Shape({
        fromArrow: "StretchedDiamond",
        fill: "white",
        scale: 1.3,
      }),
      new go.Shape({ toArrow: "OpenTriangle" }),
    ),
  );

  // Initial data
  diagram.model = new go.GraphLinksModel({
    copiesArrays: true,
    copiesArrayObjects: true,
    linkCategoryProperty: "relationship",
    nodeDataArray: [],
    linkDataArray: [
      { from: 1, to: 11, relationship: "Aggregation" },
      { from: 1, to: 60, relationship: "Aggregation" },
    ],
  });

  // Save the diagram instance
  diagramInstance = diagram;

  return diagram;
}

function addPersonNode() {
  if (!diagramInstance) {
    console.error("Diagram instance is not initialized yet.");
    return;
  }

  const newPerson = {
    key: diagramInstance.model.nodeDataArray.length + 1,
    name: "Person",
    properties: [
      { name: "name", type: "String", visibility: "public" },
      { name: "birth", type: "Date", visibility: "protected" },
    ],
    methods: [{ name: "getCurrentAge", type: "int", visibility: "public" }],
  };

  // Add the new node to the diagram model
  diagramInstance.model.addNodeData(newPerson);
  console.log("New node added:", newPerson);
}

export default function App() {
  return (
    <div>
      <button
        onClick={addPersonNode}
        style={{ margin: "10px", padding: "10px" }}
      >
        Add Test
      </button>
      <ReactDiagram
        initDiagram={initDiagram}
        divClassName="diagram-component"
        style={{ width: "1920px", height: "800px" }}
      />
    </div>
  );
}
