import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  useEffect(() => {
    fetch(
      "https://raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json",
    )
      .then((response) => response.json())
      .then((data) => {
        setData(data); // Save the data in state
      })
      .catch((error) => {
        setError(error); // Save error in case fetching fails
      });
  }, []);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) {
      return null;
    }
    return sortConfig.direction === "asc" ? "▲" : "▼";
  };

  const sortedData = React.useMemo(() => {
    if (!data) return [];
    const sortableData = Object.entries(data)
      .filter(([modelName]) => modelName !== "sample_spec") // Skip "sample_spec"
      .map(([modelName, modelData]) => {
        const maxPromptTokens =
          modelData.max_input_tokens || modelData.max_tokens || "-";
        const maxOutputTokens =
          modelData.max_output_tokens || modelData.max_tokens || "-";
        const promptCostPerToken = modelData.input_cost_per_token
          ? parseFloat(modelData.input_cost_per_token).toFixed(6)
          : "-";
        const completionCostPerToken = modelData.output_cost_per_token
          ? parseFloat(modelData.output_cost_per_token).toFixed(6)
          : "-";
        const promptCostPerMillion = modelData.input_cost_per_token
          ? (modelData.input_cost_per_token * 1_000_000).toFixed(2)
          : "-";
        const completionCostPerMillion = modelData.output_cost_per_token
          ? (modelData.output_cost_per_token * 1_000_000).toFixed(2)
          : "-";
        return {
          modelName,
          promptCostPerToken:
            promptCostPerToken !== "-" ? parseFloat(promptCostPerToken) : "-",
          completionCostPerToken:
            completionCostPerToken !== "-"
              ? parseFloat(completionCostPerToken)
              : "-",
          promptCostPerMillion:
            promptCostPerMillion !== "-"
              ? parseFloat(promptCostPerMillion)
              : "-",
          completionCostPerMillion:
            completionCostPerMillion !== "-"
              ? parseFloat(completionCostPerMillion)
              : "-",
          maxPromptTokens:
            maxPromptTokens !== "-" ? parseInt(maxPromptTokens, 10) : "-",
          maxOutputTokens:
            maxOutputTokens !== "-" ? parseInt(maxOutputTokens, 10) : "-",
        };
      });

    if (sortConfig.key) {
      sortableData.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        // Handle missing values (displayed as "-")
        if (aValue === "-" && bValue !== "-") return 1;
        if (bValue === "-" && aValue !== "-") return -1;
        if (aValue === "-" && bValue === "-") return 0;

        // Handle sorting for both numbers and strings
        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortConfig.direction === "asc"
            ? aValue - bValue
            : bValue - aValue;
        }
        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortConfig.direction === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        return 0;
      });
    }

    return sortableData;
  }, [data, sortConfig]);

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      <h1>Model Prices and Context Window</h1>
      <table>
        <thead>
          <tr>
            <th onClick={() => handleSort("modelName")}>
              Model Name {getSortIndicator("modelName")}
            </th>
            <th onClick={() => handleSort("promptCostPerToken")}>
              Prompt Cost per Token (USD){" "}
              {getSortIndicator("promptCostPerToken")}
            </th>
            <th onClick={() => handleSort("completionCostPerToken")}>
              Completion Cost per Token (USD){" "}
              {getSortIndicator("completionCostPerToken")}
            </th>
            <th onClick={() => handleSort("promptCostPerMillion")}>
              Prompt Cost per 1M Tokens (USD){" "}
              {getSortIndicator("promptCostPerMillion")}
            </th>
            <th onClick={() => handleSort("completionCostPerMillion")}>
              Completion Cost per 1M Tokens (USD){" "}
              {getSortIndicator("completionCostPerMillion")}
            </th>
            <th onClick={() => handleSort("maxPromptTokens")}>
              Max Prompt Tokens {getSortIndicator("maxPromptTokens")}
            </th>
            <th onClick={() => handleSort("maxOutputTokens")}>
              Max Output Tokens {getSortIndicator("maxOutputTokens")}
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((model) => (
            <tr key={model.modelName}>
              <td>{model.modelName}</td>
              <td>
                {model.promptCostPerToken !== "-"
                  ? model.promptCostPerToken.toFixed(9)
                  : "-"}
              </td>
              <td>
                {model.completionCostPerToken !== "-"
                  ? model.completionCostPerToken.toFixed(9)
                  : "-"}
              </td>
              <td>
                {model.promptCostPerMillion !== "-"
                  ? model.promptCostPerMillion.toFixed(2)
                  : "-"}
              </td>
              <td>
                {model.completionCostPerMillion !== "-"
                  ? model.completionCostPerMillion.toFixed(2)
                  : "-"}
              </td>
              <td>{model.maxPromptTokens}</td>
              <td>{model.maxOutputTokens}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
