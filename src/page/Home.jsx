import React, { useEffect, useRef, useState } from "react";
import Panelsheet from "../components/Panelsheet";
import Stocksheet from "../components/Stocksheet";
import { read, utils } from "xlsx";
import "../home.css";
import { displayPanelAndSheetInfo } from "../utils/functions";
import CollapsibleTable from "../components/CollapsibleTable";
import Header from "../components/Header";
import Spinner from "../components/Spinner";
import SheetTable from "../components/SheetTable";

const Home = () => {
  const unitOptions = [
    { value: "", label: "Select a Unit" },
    { value: "in", label: "Inches" },
    { value: "cm", label: "Centimeters" },
    { value: "mm", label: "Millimeters" },
  ];

  const [totalCutLength, setTotalCutLength] = useState(0);
  const [loading, setLoading] = useState(false);
  const [usedStockSheets, setUsedStockSheets] = useState("");
  const [panelRows, setPanelRows] = useState([
    {
      id: 1,
      length: "100",
      quantity: "10",
      label: "pane",
      width: "100",
      material: "",
      result: "50",
      grainDirection: "horizontal",
      selected: true,
    },
  ]);
  const [stockSheetRows, setStockSheetRows] = useState([
    {
      id: 1,
      length: "500",
      quantity: "1",
      width: "700",
      label: "sheet",
      material: "",
      result: "",
      selected: true,
      grainDirection: "vertical",
    },
  ]);
  const [unit, setUnit] = useState("in");
  const [optimizationCompleted, setOptimizationCompleted] = useState(false);
  const [sheetDetails, setSheetDetails] = useState([]);
  const [panelThickness, setPanelThickness] = useState("0");
  const [panelLabel, setPanelLabel] = useState(true);
  const [totalArea, setTotalArea] = useState("");
  const [percentTotalArea, setPercentTotalArea] = useState("");
  const [totalUsedArea, setTotalUsedArea] = useState("");
  const [totalUsedAreaPercentage, setTotalUsedAreaPercentage] = useState("");
  const [totalWastedArea, setTotalWastedArea] = useState("");
  const [totalWastedAreaPercentage, setTotalWastedAreaPercentage] =
    useState("");
  const [changeIntialUnit, setChangeIntialUnit] = useState(false);
  const [totalCuts, setTotalCuts] = useState("");
  const [globalStatistics, setGlobalStatistics] = useState([]);

  const [selectedPanelFile, setSelectedPanelFile] = useState(null);
  const [selectedSheetFile, setSelectedSheetFile] = useState(null);
  const [addMaterialToSheets, setAddMaterialToSheets] = useState(false);
  const [considerGrainDirection, setConsiderGrainDirection] = useState(false);

  useEffect(() => {
    setChangeIntialUnit(false);
  }, []);

  const handleChange = (e, type) => {
    console.log(e.target, type, e.target.name);
    const file = e.target.files[0];
    if (type === "panels") {
      setSelectedPanelFile(file);
    } else {
      setSelectedSheetFile(file);
    }
  };

  const handleUpload = (id) => {
    const selectedFile =
      id === "panels" ? selectedPanelFile : selectedSheetFile;
    const dataRows = id === "panels" ? panelRows : stockSheetRows;
    console.log({ dataRows, id });
    if (selectedFile) {
      console.log("Uploading file:", selectedFile);

      if (
        selectedFile.name.endsWith(".xls") ||
        selectedFile.name.endsWith(".xlsx")
      ) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const binaryData = e.target.result;
          const workbook = read(binaryData, { type: "binary" });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const sheetData = utils.sheet_to_json(sheet, { header: 1 });

          // Assuming the first row contains headers
          const headers = sheetData[0];
          const parsedData = [];

          for (let i = 1; i < sheetData.length; i++) {
            const row = sheetData[i];
            const rowData = {};
            for (let j = 0; j < headers.length; j++) {
              rowData[headers[j]] = row[j];
            }
            parsedData.push(rowData);
          }

          const dataNeeded = parsedData.map((data) => ({
            length: data.length ?? "",
            quantity: data.quantity ?? "",
            label: data.label ?? "",
            width: data.width ?? "",
            id: parseInt(Math.random() * data.length),
            result: data.result ?? "",
          }));
          const newRows = dataRows
            .concat(dataNeeded)
            .filter((data) => data.length !== "");
          if (id === "sheets") {
            setStockSheetRows(newRows);
          } else {
            setPanelRows(newRows);
          }

          setSelectedPanelFile(null);
          setSelectedSheetFile(null);
        };
        reader.readAsBinaryString(selectedFile);
        setSelectedPanelFile(null);
        setSelectedSheetFile(null);
      } else {
        console.error("Uploaded file is not an Excel file");
      }
    }
  };

  const handleUnitInput = (event) => {
    setUnit(event.target.value);
  };

  function optimizeData() {
    // getActualValueBasedOnUnit(unit);
    setLoading(true);
    setOptimizationCompleted(false);

    const filteredStockSheet = filterUnusedData(stockSheetRows);
    const filteredPanelSheet = filterUnusedData(panelRows);

    console.log({ filteredStockSheet, filteredPanelSheet });

    const response = displayPanelAndSheetInfo(
      filteredStockSheet,
      filteredPanelSheet,
      panelLabel,
      parseInt(panelThickness) <= -1 || panelThickness === ""
        ? 0
        : parseInt(panelThickness),
      unit
    );
    const { totalData: results, getGlobalSheetStatistics } = response;
    setGlobalStatistics(getGlobalSheetStatistics);
    setOptimizationCompleted(true);
    setTotalCutLength(results.totalCutLength);
    setUsedStockSheets(results.usedStockSheets);
    setTotalArea(results.totalArea);
    setPercentTotalArea(results.percentTotalArea);
    setTotalUsedArea(results.totalAreaUsed);
    setTotalUsedAreaPercentage(results.totalUsedAreaPercentage);
    setTotalWastedArea(results.totalWastedArea);
    setTotalWastedAreaPercentage(results.totalWastedAreaPercentage);
    setTotalCuts(results.totalCuts);
    setSheetDetails(results.sheetDetails);
    setPanelThickness(results.panelThickness);
    console.log({ results });
    setLoading(false);
  }

  const filterUnusedData = (data) => {
    return data.filter((data) => data.selected);
  };

  function getActualValueBasedOnUnit(unit) {
    console.log("mdkeoeo demkdkkdjlkm doldklkdop");
    const DPIValues = getDPI();
    console.log({ DPIValues });
    if (!changeIntialUnit) {
      console.log({ unit, changeIntialUnit });
      // whatever unit put there is the data we are going with
      if (unit === "in") {
        const newStockValues = stockSheetRows.map((data) => {
          return {
            length: parseInt(data.length) * DPIValues,
            width: parseInt(data.width) * DPIValues,
          };
        });
        console.log({ newStockValues });
      }
    }
  }

  function getDPI() {
    // Create a temporary element to measure DPI
    const div = document.createElement("div");
    div.style.width = "1in";
    document.body.appendChild(div);
    const dpi = div.offsetWidth;
    document.body.removeChild(div);
    return dpi;
  }

  const conversionList = {
    cm: "0.026458333cm",
    in: "0.0104166665in",
  };

  return (
    <div>
      <Header optimizeData={optimizeData} />

      {loading ? (
        <Spinner />
      ) : (
        <div className={`container app ${loading ? "blur" : ""}`}>
          <h1>Panel and Sheet Information</h1>

          <div className="row">
            <div className="col">
              <div style={{ margin: "50px 0" }}>
                <Stocksheet
                  stockSheetRows={stockSheetRows}
                  setStockSheetRows={setStockSheetRows}
                  panelLabel={panelLabel}
                  handleFileChange={(e) => handleChange(e, "sheets")}
                  selectedFile={selectedSheetFile}
                  setChangeIntialUnit={setChangeIntialUnit}
                  handleUpload={() => handleUpload("sheets")}
                  addMaterialToSheets={addMaterialToSheets}
                  considerGrainDirection={considerGrainDirection}
                />
                <div style={{ margin: "50px 0" }}>
                  <Panelsheet
                    panelRows={panelRows}
                    setPanelRows={setPanelRows}
                    panelLabel={panelLabel}
                    setChangeIntialUnit={setChangeIntialUnit}
                    handleFileChange={(e) => handleChange(e, "panels")}
                    selectedFile={selectedPanelFile}
                    handleUpload={() => handleUpload("panels")}
                    addMaterialToSheets={addMaterialToSheets}
                    considerGrainDirection={considerGrainDirection}
                  />
                </div>
              </div>
            </div>
          </div>
          <br />

          <div className="row border bg-light pt-4">
            <div className="col-md-4">
              <div className="form-group">
                <label htmlFor="cutThickness">
                  Cut / Blade / Kerf Thickness:
                </label>
                <div>
                  <input
                    type="text"
                    id="cutThickness"
                    name="cutThickness"
                    value={panelThickness}
                    onChange={(e) => setPanelThickness(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="form-group">
                <label htmlFor="exampleSelect">Select Unit</label>
                <select
                  className="form-control"
                  id="exampleSelect"
                  value={unit}
                  onChange={handleUnitInput}
                >
                  {unitOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="col-md-4">
              <div
                className="form-group"
                style={{ display: "flex", marginTop: "30px" }}
              >
                <label
                  htmlFor="grainDirection"
                  style={{
                    display: "block",
                    marginRight: "10px",
                    marginTop: "5px",
                  }}
                >
                  Consider Grain Direction:
                </label>
                <label className="switch">
                  <input
                    type="checkbox"
                    id="grainDirection"
                    name="grainDirection"
                    onChange={(e) =>
                      setConsiderGrainDirection(e.target.checked)
                    }
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          </div>
          <div className="row border bg-light pt-4">
            <div className="col-md-4">
              <div className="form-group" style={{ display: "flex" }}>
                <label
                  htmlFor="addMaterialToSheets"
                  style={{
                    display: "block",
                    marginRight: "10px",
                    marginTop: "5px",
                  }}
                >
                  Consider Material:
                </label>
                <label className="switch">
                  <input
                    type="checkbox"
                    id="addMaterialToSheets"
                    name="addMaterialToSheets"
                    onChange={(e) => setAddMaterialToSheets(e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>

            <div className="col-md-4">
              <div className="form-group" style={{ display: "flex" }}>
                <label
                  htmlFor="panelLabels"
                  style={{
                    display: "block",
                    marginRight: "10px",
                    marginTop: "5px",
                  }}
                >
                  Labels on Panels:
                </label>
                <label className="switch">
                  <input
                    type="checkbox"
                    id="panelLabels"
                    name="panelLabels"
                    onChange={(e) => setPanelLabel(e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>

            <div className="col-md-4">
              <div className="form-group" style={{ display: "flex" }}>
                <label
                  htmlFor="singleSheet"
                  style={{
                    display: "block",
                    marginRight: "10px",
                    marginTop: "5px",
                  }}
                >
                  Use Only One Sheet from Stock:
                </label>
                <label className="switch">
                  <input type="checkbox" id="singleSheet" name="singleSheet" />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          </div>

          <div className="my-5">
            <div>
              <h2>Drawing / Visualization:</h2>
              <div>
                <div id="labels">
                  <h6>Dimension (L x W)</h6>
                </div>
                <div id="svgContainer">SVG will be appended here</div>

                <canvas
                  id="outerCanvas"
                  style={{ borderColor: "white" }}
                  width="1"
                  height="1"
                ></canvas>
              </div>
              {optimizationCompleted && (
                <div>
                  <div className="container">
                    <div id="result" className="sheets">
                      Sheets representation will be displayed here
                    </div>
                  </div>
                  <div className="mb-5">
                    <CollapsibleTable
                      totalUsedArea={totalUsedArea}
                      totalUsedAreaPercentage={totalUsedAreaPercentage}
                      totalCutLength={totalCutLength}
                      totalCuts={totalCuts}
                      sheetDetails={sheetDetails}
                      totalWastedArea={totalWastedArea}
                      totalWastedAreaPercentage={totalWastedAreaPercentage}
                      panelThickness={panelThickness}
                    />
                  </div>
                  <div className="mb-5">
                    <SheetTable globalStatistics={globalStatistics} />
                  </div>
                </div>
              )}
            </div>
            <br />
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
