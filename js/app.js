const DATA_URL = "data/financials.json";

let revenueProfitChart = null;
let profitabilityChart = null;
let balanceChart = null;
let cashFlowChart = null;


// ========================================
// LOAD DATA
// ========================================

async function loadFinancialData() {
  try {
    const response = await fetch(DATA_URL);

    if (!response.ok) {
      throw new Error(
        `Could not load financial data: ${response.status}`
      );
    }

    const data = await response.json();

    renderDashboard(data);

  } catch (error) {
    console.error(
      "Error loading financial data:",
      error
    );
  }
}


// ========================================
// DASHBOARD
// ========================================

function renderDashboard(data) {
  const years = Object.keys(data.years)
    .sort(
      (a, b) =>
        Number(a) - Number(b)
    );

  if (years.length < 2) {
    console.error(
      "At least two years of data are required."
    );

    return;
  }


  const latestYear =
    years[years.length - 1];

  const previousYear =
    years[years.length - 2];


  const latest =
    data.years[latestYear];

  const previous =
    data.years[previousYear];


  // KPI calculations
  const revenueGrowth =
    calculateGrowth(
      latest.revenue,
      previous.revenue
    );

  const netIncomeGrowth =
    calculateGrowth(
      latest.netIncome,
      previous.netIncome
    );

  const netMarginChange =
    latest.netMargin -
    previous.netMargin;

  const fcfGrowth =
    calculateGrowth(
      latest.freeCashFlow,
      previous.freeCashFlow
    );


  // KPI values
  setText(
    "revenue-value",
    formatBillions(
      latest.revenue
    )
  );

  setText(
    "net-income-value",
    formatBillions(
      latest.netIncome
    )
  );

  setText(
    "net-margin-value",
    `${latest.netMargin.toFixed(1)}%`
  );

  setText(
    "fcf-value",
    formatBillions(
      latest.freeCashFlow
    )
  );


  // KPI changes
  setText(
    "revenue-change",
    formatGrowth(
      revenueGrowth
    )
  );

  setText(
    "net-income-change",
    formatGrowth(
      netIncomeGrowth
    )
  );

  setText(
    "net-margin-change",
    formatPercentagePointChange(
      latest.netMargin,
      previous.netMargin
    )
  );

  setText(
    "fcf-change",
    formatGrowth(
      fcfGrowth
    )
  );


  // KPI styles
  applyChangeStyle(
    "revenue-change",
    revenueGrowth
  );

  applyChangeStyle(
    "net-income-change",
    netIncomeGrowth
  );

  applyChangeStyle(
    "net-margin-change",
    netMarginChange
  );

  applyChangeStyle(
    "fcf-change",
    fcfGrowth
  );


  // Charts
  renderRevenueProfitChart(
    data,
    years
  );

  renderProfitabilityChart(
    data,
    years
  );

  renderBalanceChart(
    data,
    years
  );

  renderCashFlowChart(
    data,
    years
  );


  // Ratios
  renderFinancialRatios(
    data,
    latest
  );


  // Findings
  renderFindings(data);
}


// ========================================
// HELPERS
// ========================================

function setText(
  elementId,
  value
) {
  const element =
    document.getElementById(
      elementId
    );

  if (!element) {
    console.warn(
      `Element not found: ${elementId}`
    );

    return;
  }

  element.textContent = value;
}


function calculateGrowth(
  currentValue,
  previousValue
) {
  if (
    previousValue === 0 ||
    previousValue === null ||
    previousValue === undefined
  ) {
    return 0;
  }

  return (
    (
      (currentValue - previousValue)
      / previousValue
    )
    * 100
  );
}


function formatBillions(value) {
  return `$${Number(value).toFixed(1)}B`;
}


function formatGrowth(value) {
  const sign =
    value >= 0
      ? "+"
      : "";

  return (
    `${sign}${value.toFixed(1)}% YoY`
  );
}


function formatPercentagePointChange(
  current,
  previous
) {
  const difference =
    current - previous;

  const sign =
    difference >= 0
      ? "+"
      : "";

  return (
    `${sign}${difference.toFixed(1)} pp`
  );
}


function applyChangeStyle(
  elementId,
  value
) {
  const element =
    document.getElementById(
      elementId
    );

  if (!element) {
    return;
  }

  if (value < 0) {
    element.classList.add(
      "negative"
    );
  } else {
    element.classList.remove(
      "negative"
    );
  }
}


// ========================================
// FINANCIAL RATIOS
// ========================================

function renderFinancialRatios(
  data,
  latest
) {
  if (
    data.summary &&
    typeof data.summary.revenueCAGR
      === "number"
  ) {
    setText(
      "revenue-cagr",
      `${data.summary.revenueCAGR.toFixed(1)}%`
    );
  }


  if (
    typeof latest.fcfMargin
      === "number"
  ) {
    setText(
      "fcf-margin",
      `${latest.fcfMargin.toFixed(1)}%`
    );
  }


  if (
    typeof latest.debtToAssets
      === "number"
  ) {
    setText(
      "debt-assets",
      `${
        (
          latest.debtToAssets
          * 100
        ).toFixed(1)
      }%`
    );
  }


  if (
    typeof latest.cashToDebt
      === "number"
  ) {
    setText(
      "cash-debt",
      `${latest.cashToDebt.toFixed(2)}x`
    );
  }
}


// ========================================
// FINDINGS
// ========================================

function renderFindings(data) {
  const container =
    document.getElementById(
      "findings-container"
    );

  if (!container) {
    return;
  }


  if (
    !Array.isArray(data.findings) ||
    data.findings.length === 0
  ) {
    container.innerHTML =
      "<p>No findings available.</p>";

    return;
  }


  container.innerHTML = "";


  data.findings.forEach(
    (finding, index) => {

      const card =
        document.createElement(
          "article"
        );

      card.className =
        "finding-card";


      const number =
        document.createElement(
          "span"
        );

      number.className =
        "finding-number";

      number.textContent =
        String(index + 1)
          .padStart(
            2,
            "0"
          );


      const title =
        document.createElement(
          "h3"
        );

      title.className =
        "finding-title";

      title.textContent =
        finding.title;


      const text =
        document.createElement(
          "p"
        );

      text.textContent =
        finding.text;


      card.appendChild(
        number
      );

      card.appendChild(
        title
      );

      card.appendChild(
        text
      );


      container.appendChild(
        card
      );
    }
  );
}


// ========================================
// REVENUE & NET INCOME
// ========================================

function renderRevenueProfitChart(
  data,
  years
) {
  const canvas =
    document.getElementById(
      "revenue-profit-chart"
    );

  if (!canvas) {
    return;
  }


  const revenueData =
    years.map(
      year =>
        data.years[year].revenue
    );


  const netIncomeData =
    years.map(
      year =>
        data.years[year].netIncome
    );


  if (revenueProfitChart) {
    revenueProfitChart.destroy();
  }


  revenueProfitChart =
    new Chart(
      canvas,
      {
        type: "line",

        data: {
          labels: years,

          datasets: [
            {
              label: "Revenue",

              data: revenueData,

              borderColor:
                "#0F2E7A",

              backgroundColor:
                "rgba(15, 46, 122, 0.08)",

              borderWidth: 3,

              pointRadius: 4,

              pointHoverRadius: 6,

              tension: 0.35,

              fill: true
            },

            {
              label: "Net Income",

              data: netIncomeData,

              borderColor:
                "#4E7DE9",

              backgroundColor:
                "transparent",

              borderWidth: 3,

              pointRadius: 4,

              pointHoverRadius: 6,

              tension: 0.35
            }
          ]
        },


        options: {
          responsive: true,

          maintainAspectRatio: false,

          interaction: {
            mode: "index",
            intersect: false
          },

          plugins: {
            legend: {
              position: "bottom",

              labels: {
                usePointStyle: true,
                padding: 24
              }
            },

            tooltip: {
              callbacks: {
                label(context) {
                  return (
                    `${context.dataset.label}: `
                    + `$${context.parsed.y.toFixed(1)}B`
                  );
                }
              }
            }
          },

          scales: {
            x: {
              grid: {
                display: false
              },

              ticks: {
                color:
                  "#5E6A85"
              }
            },

            y: {
              beginAtZero: true,

              grid: {
                color:
                  "rgba(201, 216, 255, 0.45)"
              },

              ticks: {
                color:
                  "#5E6A85",

                callback(value) {
                  return `$${value}B`;
                }
              }
            }
          }
        }
      }
    );
}


// ========================================
// PROFITABILITY
// ========================================

function renderProfitabilityChart(
  data,
  years
) {
  const canvas =
    document.getElementById(
      "profitability-chart"
    );

  if (!canvas) {
    return;
  }


  const grossMarginData =
    years.map(
      year =>
        data.years[year]
          .grossMargin
    );


  const operatingMarginData =
    years.map(
      year =>
        data.years[year]
          .operatingMargin
    );


  const netMarginData =
    years.map(
      year =>
        data.years[year]
          .netMargin
    );


  if (profitabilityChart) {
    profitabilityChart.destroy();
  }


  profitabilityChart =
    new Chart(
      canvas,
      {
        type: "line",

        data: {
          labels: years,

          datasets: [
            {
              label:
                "Gross Margin",

              data:
                grossMarginData,

              borderColor:
                "#0F2E7A",

              backgroundColor:
                "transparent",

              borderWidth: 3,

              pointRadius: 3,

              pointHoverRadius: 5,

              tension: 0.35
            },

            {
              label:
                "Operating Margin",

              data:
                operatingMarginData,

              borderColor:
                "#4E7DE9",

              backgroundColor:
                "transparent",

              borderWidth: 3,

              pointRadius: 3,

              pointHoverRadius: 5,

              tension: 0.35
            },

            {
              label:
                "Net Margin",

              data:
                netMarginData,

              borderColor:
                "#8FB1FF",

              backgroundColor:
                "transparent",

              borderWidth: 3,

              pointRadius: 3,

              pointHoverRadius: 5,

              tension: 0.35
            }
          ]
        },


        options: {
          responsive: true,

          maintainAspectRatio: false,

          interaction: {
            mode: "index",
            intersect: false
          },

          plugins: {
            legend: {
              position: "bottom",

              labels: {
                usePointStyle: true,

                padding: 18,

                boxWidth: 8,

                font: {
                  size: 12
                }
              }
            },

            tooltip: {
              callbacks: {
                label(context) {
                  return (
                    `${context.dataset.label}: `
                    + `${context.parsed.y.toFixed(1)}%`
                  );
                }
              }
            }
          },

          scales: {
            x: {
              grid: {
                display: false
              },

              ticks: {
                color:
                  "#5E6A85"
              }
            },

            y: {
              beginAtZero: false,

              grid: {
                color:
                  "rgba(201, 216, 255, 0.45)"
              },

              ticks: {
                color:
                  "#5E6A85",

                callback(value) {
                  return `${value}%`;
                }
              }
            }
          }
        }
      }
    );
}


// ========================================
// BALANCE
// ========================================

function renderBalanceChart(
  data,
  years
) {
  const canvas =
    document.getElementById(
      "balance-chart"
    );

  if (!canvas) {
    return;
  }


  const assetsData =
    years.map(
      year =>
        data.years[year]
          .totalAssets
    );


  const debtData =
    years.map(
      year =>
        data.years[year]
          .totalDebt
    );


  const cashData =
    years.map(
      year =>
        data.years[year]
          .cash
    );


  if (balanceChart) {
    balanceChart.destroy();
  }


  balanceChart =
    new Chart(
      canvas,
      {
        type: "bar",

        data: {
          labels: years,

          datasets: [
            {
              label:
                "Total Assets",

              data:
                assetsData,

              backgroundColor:
                "#0F2E7A",

              borderRadius: 6,

              borderSkipped: false
            },

            {
              label:
                "Total Debt",

              data:
                debtData,

              backgroundColor:
                "#4E7DE9",

              borderRadius: 6,

              borderSkipped: false
            },

            {
              label: "Cash",

              data:
                cashData,

              backgroundColor:
                "#AFC6FF",

              borderRadius: 6,

              borderSkipped: false
            }
          ]
        },


        options: {
          responsive: true,

          maintainAspectRatio: false,

          interaction: {
            mode: "index",
            intersect: false
          },

          plugins: {
            legend: {
              position:
                "bottom",

              labels: {
                usePointStyle: true,

                padding: 18,

                boxWidth: 8,

                font: {
                  size: 12
                }
              }
            },

            tooltip: {
              callbacks: {
                label(context) {
                  return (
                    `${context.dataset.label}: `
                    + `$${context.parsed.y.toFixed(1)}B`
                  );
                }
              }
            }
          },

          scales: {
            x: {
              grid: {
                display: false
              },

              ticks: {
                color:
                  "#5E6A85"
              }
            },

            y: {
              beginAtZero: true,

              grid: {
                color:
                  "rgba(201, 216, 255, 0.45)"
              },

              ticks: {
                color:
                  "#5E6A85",

                callback(value) {
                  return `$${value}B`;
                }
              }
            }
          }
        }
      }
    );
}


// ========================================
// CASH FLOW
// ========================================

function renderCashFlowChart(
  data,
  years
) {
  const canvas =
    document.getElementById(
      "cash-flow-chart"
    );

  if (!canvas) {
    return;
  }


  const operatingCashFlowData =
    years.map(
      year =>
        data.years[year]
          .operatingCashFlow
    );


  const capexData =
    years.map(
      year =>
        -data.years[year].capex
    );


  const freeCashFlowData =
    years.map(
      year =>
        data.years[year]
          .freeCashFlow
    );


  if (cashFlowChart) {
    cashFlowChart.destroy();
  }


  cashFlowChart =
    new Chart(
      canvas,
      {
        data: {
          labels: years,

          datasets: [
            {
              type: "bar",

              label:
                "Operating Cash Flow",

              data:
                operatingCashFlowData,

              backgroundColor:
                "#0F2E7A",

              borderRadius: 6,

              borderSkipped: false
            },

            {
              type: "bar",

              label: "CapEx",

              data:
                capexData,

              backgroundColor:
                "#AFC6FF",

              borderRadius: 6,

              borderSkipped: false
            },

            {
              type: "line",

              label:
                "Free Cash Flow",

              data:
                freeCashFlowData,

              borderColor:
                "#4E7DE9",

              backgroundColor:
                "#4E7DE9",

              borderWidth: 3,

              pointRadius: 4,

              pointHoverRadius: 6,

              tension: 0.35
            }
          ]
        },


        options: {
          responsive: true,

          maintainAspectRatio: false,

          interaction: {
            mode: "index",
            intersect: false
          },

          plugins: {
            legend: {
              position:
                "bottom",

              labels: {
                usePointStyle: true,
                padding: 24
              }
            },

            tooltip: {
              callbacks: {
                label(context) {
                  const value =
                    context.parsed.y;

                  if (
                    context.dataset.label
                    === "CapEx"
                  ) {
                    return (
                      `CapEx: $${Math.abs(value).toFixed(1)}B`
                    );
                  }

                  return (
                    `${context.dataset.label}: `
                    + `$${value.toFixed(1)}B`
                  );
                }
              }
            }
          },

          scales: {
            x: {
              grid: {
                display: false
              },

              ticks: {
                color:
                  "#5E6A85"
              }
            },

            y: {
              grid: {
                color:
                  "rgba(201, 216, 255, 0.45)"
              },

              ticks: {
                color:
                  "#5E6A85",

                callback(value) {
                  return `$${value}B`;
                }
              }
            }
          }
        }
      }
    );
}


// ========================================
// START
// ========================================

loadFinancialData();