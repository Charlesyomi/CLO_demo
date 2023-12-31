import React, { useEffect, useRef, useState } from "react";
import Worksheet from "../components/Worksheet";
import Stocksheet from "../components/Stocksheet";
import { read, utils } from "xlsx";

import { optimizePanels } from "../utils/functions";

const Home = () => {
  const [totalCutLength, setTotalCutLength] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [usedStockSheets, setUsedStockSheets] = useState("");
  const fileInputRef = useRef(null);
  const [rows, setRows] = useState([
    { id: 1, height: "", quantity: "", label: "", width: "", result: "" },
  ]);
  const [unit, setUnit] = useState("in");
  const [panelThickness, setPanelThickness] = useState("0");
  const [panelLabel, setPanelLabel] = useState(false);
  const [totalArea, setTotalArea] = useState("");
  const [totalUsedArea, setTotalUsedArea] = useState("");
  const [totalUsedAreaPercentage, setTotalUsedAreaPercentage] = useState("");
  const [totalWastedArea, setTotalWastedArea] = useState("");
  const [totalWastedAreaPercentage, setTotalWastedAreaPercentage] =
    useState("");
  const [totalCuts, setTotalCuts] = useState("");
  const [inputValues, setInputValues] = useState({
    totalStockWidth: "",
    totalStockHeight: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (e) => {
    console.log(e.target);
    const file = e.target.files[0];
    setSelectedFile(file);
  };

  // const svgContainerRef = useRef(null);
  // const svgImageRef = useRef(null);
  // const [viewBox, setViewBox] = useState({ x: 0, y: 0, w: 0, h: 0 });
  // const [isPanning, setIsPanning] = useState(false);
  // const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  // const svgSize = {
  //   w: svgImageRef.current?.clientWidth,
  //   h: svgImageRef.current?.clientHeight,
  // };
  // let scale = 1;

  // useEffect(() => {
  //   const svgContainer = svgContainerRef.current;

  //   const handleWheel = (e) => {
  //     e.preventDefault();
  //     const w = viewBox.w;
  //     const h = viewBox.h;
  //     const mx = e.offsetX;
  //     const my = e.offsetY;
  //     const dw = w * Math.sign(e.deltaY) * 0.05;
  //     const dh = h * Math.sign(e.deltaY) * 0.05;
  //     const dx = dw * (mx / svgSize.w);
  //     const dy = dh * (my / svgSize.h);
  //     const newViewBox = {
  //       x: viewBox.x + dx,
  //       y: viewBox.y + dy,
  //       w: viewBox.w - dw,
  //       h: viewBox.h - dh,
  //     };
  //     scale = svgSize.w / newViewBox.w;
  //     setViewBox(newViewBox);
  //   };

  //   const handleMouseDown = (e) => {
  //     setIsPanning(true);
  //     setStartPoint({ x: e.clientX, y: e.clientY });
  //   };

  //   const handleMouseMove = (e) => {
  //     if (isPanning) {
  //       const endPoint = { x: e.clientX, y: e.clientY };
  //       const dx = (startPoint.x - endPoint.x) / scale;
  //       const dy = (startPoint.y - endPoint.y) / scale;
  //       const movedViewBox = {
  //         x: viewBox.x + dx,
  //         y: viewBox.y + dy,
  //         w: viewBox.w,
  //         h: viewBox.h,
  //       };
  //       setViewBox(movedViewBox);
  //       setStartPoint({ x: endPoint.x, y: endPoint.y });
  //     }
  //   };

  //   const handleMouseUp = (e) => {
  //     if (isPanning) {
  //       const endPoint = { x: e.clientX, y: e.clientY };
  //       const dx = (startPoint.x - endPoint.x) / scale;
  //       const dy = (startPoint.y - endPoint.y) / scale;
  //       const newViewBox = {
  //         x: viewBox.x + dx,
  //         y: viewBox.y + dy,
  //         w: viewBox.w,
  //         h: viewBox.h,
  //       };
  //       setViewBox(newViewBox);
  //       setIsPanning(false);
  //     }
  //   };

  //   const handleMouseLeave = () => {
  //     setIsPanning(false);
  //   };

  //   if (svgContainer) {
  //     svgContainer.addEventListener("wheel", handleWheel);
  //     svgContainer.addEventListener("mousedown", handleMouseDown);
  //     svgContainer.addEventListener("mousemove", handleMouseMove);
  //     svgContainer.addEventListener("mouseup", handleMouseUp);
  //     svgContainer.addEventListener("mouseleave", handleMouseLeave);
  //   }

  //   return () => {
  //     if (svgContainer) {
  //       svgContainer.removeEventListener("wheel", handleWheel);
  //       svgContainer.removeEventListener("mousedown", handleMouseDown);
  //       svgContainer.removeEventListener("mousemove", handleMouseMove);
  //       svgContainer.removeEventListener("mouseup", handleMouseUp);
  //       svgContainer.removeEventListener("mouseleave", handleMouseLeave);
  //     }
  //   };
  // }, [viewBox, svgSize, isPanning, startPoint, loaded]);

  // Function to handle file upload (you can send it to a server here)
  const handleUpload = () => {
    if (selectedFile) {
      // Here, you can send the file to a server or perform other actions
      console.log("Uploading file:", selectedFile);

      // Check if the uploaded selectedFile has an Excel extension
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
          console.log({ sheetData });
          // Assuming the first row contains headers
          const headers = sheetData[0];
          const parsedData = [];

          // Iterate through rows and create objects with key-value pairs
          for (let i = 1; i < sheetData.length; i++) {
            const row = sheetData[i];
            const rowData = {};
            for (let j = 0; j < headers.length; j++) {
              rowData[headers[j]] = row[j];
            }
            parsedData.push(rowData);
          }

          const dataNeeded = parsedData.map((data) => ({
            height: data.height ?? "",
            quantity: data.quantity ?? "",
            label: data.label ?? "",
            width: data.width ?? "",
            id: parseInt(Math.random() * data.height),
            result: data.result ?? "",
          }));
          const newRows = rows
            .concat(dataNeeded)
            .filter((data) => data.height !== "");
          setRows(newRows);
          setSelectedFile(null);
        };
        reader.readAsBinaryString(selectedFile);
        setSelectedFile(null);
        fileInputRef.current.value = "";
      } else {
        console.error("Uploaded file is not an Excel file");
      }
    }
  };
  const [stockRows, setStockRows] = useState([
    { id: 1, height: "", quantity: "", width: "", label: "", result: "" },
  ]);

  function optimizeData() {
    optimizePanels(
      rows,
      stockRows,
      panelLabel,
      panelThickness <= 0 || panelThickness === "" ? 1 : panelThickness,
      unit
    );
    setLoaded(true);
  }

  return (
    <div className="container">
      <Stocksheet
        setStockRows={setStockRows}
        stockRows={stockRows}
        panelLabel={panelLabel}
      />
      <div style={{ margin: "30px 0" }}>
        <Worksheet
          rows={rows}
          panelLabel={panelLabel}
          setRows={setRows}
          inputValues={inputValues}
          setInputValues={setInputValues}
        />
      </div>

      <div className="custom-upload-container">
        <input
          type="file"
          id="fileInput"
          ref={fileInputRef}
          style={{ display: "none" }}
          accept=".xlsx, .xls"
          onChange={handleFileChange}
        />
        <label htmlFor="fileInput" className="custom-upload-button">
          {selectedFile
            ? `Selected File: ${selectedFile.name}`
            : "Choose an Excel file"}
        </label>
        {selectedFile && (
          <button onClick={handleUpload} className="custom-upload-button">
            Upload
          </button>
        )}
      </div>
      <div className="row border bg-light pt-4">
        <div className="col-md-5">
          <div className="form-group">
            <label for="cutThickness">Cut / Blade / Kerf Thickness:</label>
            <input
              type="text"
              id="cutThickness"
              name="cutThickness"
              min="1"
              onChange={(e) => setPanelThickness(e.target.value)}
              value={panelThickness}
            />
          </div>
        </div>

        <div className="col-md-3">
          <div className="form-group">
            <label for="panelLabels">Labels on Panels:</label>
            <label className="switch">
              <input
                type="checkbox"
                onChange={(e) => setPanelLabel(!panelLabel)}
                id="panelLabels"
                name="panelLabels"
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>

        <div className="col-md-4">
          <div className="form-group">
            <label for="singleSheet">Use Only One Sheet from Stock:</label>
            <label className="switch">
              <input type="checkbox" id="singleSheet" name="singleSheet" />
              <span className="slider"></span>
            </label>
          </div>
        </div>
        <div class="col-md-3">
          <div class="form-group">
            <label for="panelDimension">Dimension for Stock & panel</label>
            <select
              class="custom-select"
              onChange={(e) => setUnit(e.target.value)}
              value={unit}
              id="unitSelect"
              name="unitSelect"
            >
              <option value="mm">Millimeter (mm)</option>
              <option value="cm">Centimeter (cm)</option>
              <option value="m">Meter (m)</option>
              <option value="in">Inch (in)</option>
              <option value="ft">Foot (ft)</option>
              <option value="yd">Yard (yd)</option>
              <option value="pt">Point (pt)</option>
              <option value="px">Pixel (px)</option>
            </select>
          </div>
        </div>
      </div>
      <br />
      <button
        className="btn btn-primary mt-2 col-md-12"
        id="showInfo"
        onClick={optimizeData}
      >
        Calculate
      </button>
      <div>
        <p>
          Used stock sheets:{" "}
          <input
            value={usedStockSheets}
            type="text"
            id="usedStockSheets"
            disabled
          />
        </p>
        <p>
          Total area:{" "}
          <input type="text" value={totalArea} id="totalArea" disabled />
        </p>
        <p>
          Total used area:{" "}
          <input
            type="text"
            value={totalUsedArea}
            id="totalUsedArea"
            disabled
          />
        </p>
        <p>
          Total used Area Percentage:{" "}
          <input
            type="text"
            value={totalUsedAreaPercentage}
            id="totalUsedAreaPercentage"
            disabled
          />
        </p>
        <p>
          Total wasted area:{" "}
          <input
            value={totalWastedArea}
            type="text"
            id="totalWastedArea"
            disabled
          />
        </p>
        <p>
          Total wasted area percentage:{" "}
          <input
            value={totalWastedAreaPercentage}
            type="text"
            id="totalWastedAreaPercentage"
            disabled
          />
        </p>
        <p>
          Total cuts:{" "}
          <input value={totalCuts} type="text" id="totalCuts" disabled />
        </p>
        <p>
          Total cut length:{" "}
          <input
            value={totalCutLength}
            type="text"
            id="totalCutLength"
            disabled
          />
        </p>
      </div>

      <div className="col">
        <h2>Drawing / Visualization:</h2>
        <div>
          <div id="labels">
            <h6>Dimension (L x W)</h6>
          </div>
          <div id="svgContainer"></div>

          <p id="ede"></p>

          <p></p>
        </div>
        <br />
        <div className="container">
          <div id="result" className="sheets"></div>
        </div>
        <div className="container">
          <div id="drawingArea" className="sheets"></div>
        </div>
      </div>
    </div>
  );
};

export default Home;
