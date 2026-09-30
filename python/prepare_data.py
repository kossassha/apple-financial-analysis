from pathlib import Path
import json

import pandas as pd


BASE_DIR = Path(__file__).resolve().parent.parent

INPUT_FILE = BASE_DIR / "data" / "raw_financials.csv"
OUTPUT_FILE = BASE_DIR / "data" / "financials.json"


def millions_to_billions(value: float) -> float:
    return round(value / 1000, 3)


def calculate_margin(profit: float, revenue: float) -> float:
    return round((profit / revenue) * 100, 2)


def calculate_ratio(
    numerator: float,
    denominator: float
) -> float:
    return round(numerator / denominator, 3)


def calculate_cagr(
    beginning_value: float,
    ending_value: float,
    periods: int
) -> float:
    return round(
        (
            (ending_value / beginning_value)
            ** (1 / periods)
            - 1
        )
        * 100,
        2
    )


def calculate_change(
    beginning_value: float,
    ending_value: float
) -> float:
    return round(
        (
            (ending_value - beginning_value)
            / beginning_value
        )
        * 100,
        2
    )


def generate_findings(
    years: dict,
    revenue_cagr: float
) -> list:
    year_keys = sorted(years.keys())

    first_year = year_keys[0]
    last_year = year_keys[-1]

    first = years[first_year]
    last = years[last_year]

    net_margin_change = round(
        last["netMargin"] - first["netMargin"],
        2
    )

    debt_change = calculate_change(
        first["totalDebt"],
        last["totalDebt"]
    )

    positive_fcf_years = sum(
        1
        for year in year_keys
        if years[year]["freeCashFlow"] > 0
    )

    findings = [
        {
            "title": "Revenue Growth",
            "text": (
                f"Revenue increased from "
                f"${first['revenue']:.1f}B in {first_year} "
                f"to ${last['revenue']:.1f}B in {last_year}, "
                f"representing a {revenue_cagr:.1f}% CAGR."
            )
        },
        {
            "title": "Profitability",
            "text": (
                f"Net margin changed from "
                f"{first['netMargin']:.1f}% "
                f"to {last['netMargin']:.1f}%, "
                f"a change of "
                f"{net_margin_change:+.1f} percentage points."
            )
        },
        {
            "title": "Debt",
            "text": (
                f"Total debt changed from "
                f"${first['totalDebt']:.1f}B "
                f"to ${last['totalDebt']:.1f}B, "
                f"representing a "
                f"{debt_change:+.1f}% change."
            )
        },
        {
            "title": "Free Cash Flow",
            "text": (
                f"Free cash flow remained positive "
                f"in {positive_fcf_years} of "
                f"{len(year_keys)} analyzed fiscal years "
                f"and reached "
                f"${last['freeCashFlow']:.1f}B "
                f"in {last_year}."
            )
        }
    ]

    return findings


def prepare_financial_data() -> dict:
    df = pd.read_csv(INPUT_FILE)

    years = {}

    for _, row in df.iterrows():
        year = str(int(row["year"]))

        revenue = row["revenue_m"]
        gross_profit = row["gross_profit_m"]
        operating_income = row["operating_income_m"]
        net_income = row["net_income_m"]

        operating_cash_flow = row["operating_cash_flow_m"]
        capex = row["capex_m"]

        free_cash_flow = operating_cash_flow - capex

        years[year] = {
            "revenue": millions_to_billions(
                revenue
            ),

            "netIncome": millions_to_billions(
                net_income
            ),

            "grossMargin": calculate_margin(
                gross_profit,
                revenue
            ),

            "operatingMargin": calculate_margin(
                operating_income,
                revenue
            ),

            "netMargin": calculate_margin(
                net_income,
                revenue
            ),

            "operatingCashFlow": millions_to_billions(
                operating_cash_flow
            ),

            "capex": millions_to_billions(
                capex
            ),

            "freeCashFlow": millions_to_billions(
                free_cash_flow
            ),

            "totalAssets": millions_to_billions(
                row["total_assets_m"]
            ),

            "totalDebt": millions_to_billions(
                row["total_debt_m"]
            ),

            "cash": millions_to_billions(
                row["cash_m"]
            ),

            "fcfMargin": calculate_margin(
                free_cash_flow,
                revenue
            ),

            "debtToAssets": calculate_ratio(
                row["total_debt_m"],
                row["total_assets_m"]
            ),

            "cashToDebt": calculate_ratio(
                row["cash_m"],
                row["total_debt_m"]
            )
        }

    first_year = str(
        int(df.iloc[0]["year"])
    )

    last_year = str(
        int(df.iloc[-1]["year"])
    )

    periods = len(df) - 1

    revenue_cagr = calculate_cagr(
        years[first_year]["revenue"],
        years[last_year]["revenue"],
        periods
    )

    findings = generate_findings(
        years,
        revenue_cagr
    )

    return {
        "company": {
            "name": "Apple Inc.",
            "ticker": "AAPL",
            "currency": "USD",
            "period": "2021–2025",
            "unit": "USD billions",
            "yearType": "Fiscal year"
        },

        "summary": {
            "revenueCAGR": revenue_cagr
        },

        "findings": findings,

        "years": years
    }


def main():
    data = prepare_financial_data()

    with open(
        OUTPUT_FILE,
        "w",
        encoding="utf-8"
    ) as file:
        json.dump(
            data,
            file,
            indent=2,
            ensure_ascii=False
        )

    print(
        "Financial data prepared successfully."
    )

    print(
        f"Output: {OUTPUT_FILE}"
    )


if __name__ == "__main__":
    main()