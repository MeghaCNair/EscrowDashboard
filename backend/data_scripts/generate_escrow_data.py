import os, json, csv, random
from datetime import datetime, timedelta
from faker import Faker

# ---------- Config ----------
N_RECORDS = 1000
SEED = 42
OUTPUT_DIR = os.path.join("frontend", "public", "mockdata")
CSV_NAME = "synthetic_escrow_data.csv"
JSON_NAME = "synthetic_escrow_data.json"

# Cushion assumption (typical servicers keep ~2 months of escrow):
CUSHION_MONTHS = 2

# Texas counties (sample) with plausible cities & ZIPs
TX_COUNTY_INFO = {
    "Collin": {
        "cities": ["Plano", "Frisco", "Allen", "McKinney"],
        "zips":   [75013, 75024, 75025, 75034, 75035, 75070],
    },
    "Dallas": {
        "cities": ["Dallas", "Irving", "Garland", "Mesquite"],
        "zips":   [75201, 75204, 75219, 75039, 75062, 75040, 75150],
    },
    "Tarrant": {
        "cities": ["Fort Worth", "Arlington", "Grapevine"],
        "zips":   [76102, 76107, 76109, 76010, 76011, 76051],
    },
    "Travis": {
        "cities": ["Austin"],
        "zips":   [78701, 78702, 78704, 78745, 78759],
    },
    "Harris": {
        "cities": ["Houston", "Pasadena", "Pearland"],
        "zips":   [77002, 77007, 77008, 77024, 77057, 77077, 77095, 77584],
    },
}

fake = Faker("en_US")
Faker.seed(SEED)
random.seed(SEED)

def iso_date(d): 
    return d.strftime("%Y-%m-%d")

def address_for_county(county: str) -> str:
    """Return a Texas address consistent with the given county (city+ZIP anchored)."""
    cfg = TX_COUNTY_INFO[county]
    street = fake.street_address()
    city = random.choice(cfg["cities"])
    zip_code = str(random.choice(cfg["zips"])).zfill(5)
    # Always Texas
    return f"{street}, {city}, TX {zip_code}"

def generate_one():
    # ----- Identity / contact
    name = fake.name()
    contact = fake.phone_number()
    loan_number = fake.unique.random_int(10_000_000, 99_999_999)

    # Pick a TX county and produce a matching address
    county = random.choice(list(TX_COUNTY_INFO.keys()))
    property_address = address_for_county(county)

    # ----- Loan / balances
    total_loan = round(random.uniform(150_000, 900_000), 2)
    current_balance = round(total_loan * random.uniform(0.45, 0.95), 2)
    current_escrow_balance = round(random.uniform(1_000, 8_000), 2)

    # ----- Prior year tax/insurance (baseline)
    prev_tax = round(random.uniform(3_000, 7_500), 2)
    prev_ins = round(random.uniform(800, 2_500), 2)

    # ----- Forecasts (YoY deltas)
    forecast_tax = round(prev_tax * random.uniform(1.03, 1.12), 2)
    forecast_ins = round(prev_ins * random.uniform(1.01, 1.10), 2)

    # ----- Paid & upcoming dates
    last_tax_paid_date = fake.date_between(start_date="-12M", end_date="-2M")
    next_tax_pay_date = last_tax_paid_date + timedelta(days=365)

    last_ins_paid_date = fake.date_between(start_date="-12M", end_date="-2M")
    next_ins_pay_date = last_ins_paid_date + timedelta(days=365)

    # ----- Escrow analysis: surplus/shortage (simple but realistic)
    annual_outflow = forecast_tax + forecast_ins
    monthly_contrib = annual_outflow / 12.0
    cushion = CUSHION_MONTHS * monthly_contrib
    required_balance = round(annual_outflow + cushion, 2)

    gap = round(current_escrow_balance - required_balance, 2)
    forecast_surplus = gap if gap > 0 else 0.0
    forecast_shortage = -gap if gap < 0 else 0.0

    # ----- Interaction
    last_interaction_date = fake.date_between(start_date="-90d", end_date="today")
    last_interaction_type = random.choice(["Call", "Email", "Chat", "In-App Message"])
    last_interaction_summary = random.choice([
        "Asked about escrow increase explanation",
        "Requested payment schedule clarification",
        "Inquired about property tax adjustment",
        "Verified insurance premium update",
        "Follow-up on prior escrow analysis letter",
    ])

    return {
        "Customer Name": name,
        "Contact": contact,
        "Loan Number": loan_number,
        "Total Loan Amount": total_loan,
        "Current Balance": current_balance,
        "Current Escrow Balance": current_escrow_balance,
        "Prev Tax": prev_tax,
        "Prev Insurance": prev_ins,
        "Forecasted Tax": forecast_tax,
        "Forecasted Insurance": forecast_ins,
        "Last Tax Paid Date": iso_date(last_tax_paid_date),
        "Last Insurance Paid Date": iso_date(last_ins_paid_date),
        "Next Tax Pay Date": iso_date(next_tax_pay_date),
        "Next Insurance Pay Date": iso_date(next_ins_pay_date),
        "Forecasted Escrow Surplus": round(forecast_surplus, 2),
        "Forecasted Escrow Shortage": round(forecast_shortage, 2),
        "Last Interaction Date": iso_date(last_interaction_date),
        "Last Interaction Type": last_interaction_type,
        "Last Interaction Summary": last_interaction_summary,
        # New fields for Texas-only addressing:
        "County": county,
        "Property Address": property_address,
    }

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    rows = [generate_one() for _ in range(N_RECORDS)]

    # Save CSV
    csv_path = os.path.join(OUTPUT_DIR, CSV_NAME)
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=rows[0].keys())
        w.writeheader()
        w.writerows(rows)

    # Save JSON
    json_path = os.path.join(OUTPUT_DIR, JSON_NAME)
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(rows, f, ensure_ascii=False, indent=2)

    print(f"✅ Saved {N_RECORDS} records:")
    print(f"   CSV : {csv_path}")
    print(f"   JSON: {json_path}")

if __name__ == "__main__":
    main()
