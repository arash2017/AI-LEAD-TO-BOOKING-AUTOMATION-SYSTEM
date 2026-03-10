# 🤖 AI Lead-to-Booking Automation

> Fully automated pipeline: Gmail lead → AI outbound call → Google Sheets booking → Google Calendar → SMS confirmation.
> No code required to run or maintain.

---

## 📋 Overview

When a new lead email arrives in Gmail, this system automatically:

1. **Parses** the lead's name, phone, email, and service from the email body
2. **Calls** the lead using an AI voice agent (Retell AI or Vapi)
3. **Collects** booking details during the call (date, time, service)
4. **Records** the booking in Google Sheets
5. **Creates** a Google Calendar event
6. **Sends** an SMS confirmation to the customer via Twilio

Zero manual steps. Editable by a non-technical owner from a browser.

---

## 🧱 Stack

| Tool | Role |
|------|------|
| **Gmail** | Trigger — watches for new lead emails |
| **Make.com** | Automation hub — orchestrates all steps |
| **Retell AI** (or Vapi) | AI voice agent — calls the lead and books the appointment |
| **Twilio** | SMS — sends booking confirmation |
| **Google Sheets** | Database — stores all bookings |
| **Google Calendar** | Scheduling — creates events automatically |

---

## 💸 Budget

| Service | Est. Monthly |
|---------|-------------|
| Make.com (Core plan) | $9–29 |
| Retell AI (~50–100 calls) | $50–100 |
| Twilio SMS | $5–15 |
| Google (Sheets, Calendar, Gmail) | Free |
| **Total** | **~$104–224/mo** |

> Well within the $200–300/mo budget target.

---

## 🗺️ Architecture

```
Gmail (new email)
    │
    ▼
Make.com Scenario 1
    ├── Text Parser ×4 (regex: name, phone, email, service)
    └── HTTP POST → Retell AI API (trigger outbound call)

Retell AI Voice Agent
    ├── Calls lead, collects: date, time, service, name
    └── POST webhook → Make.com Scenario 2

Make.com Scenario 2 (webhook receiver)
    ├── Google Sheets → Append row
    ├── Google Calendar → Create event
    └── Twilio → Send SMS confirmation
```

---

## ⚙️ Setup

### 1. Accounts to create

- [Make.com](https://make.com) — Core plan or higher
- [Retell AI](https://retell.ai) — Buy a phone number (~$2/mo)
- [Twilio](https://twilio.com) — Buy a local number
- Google account — Gmail, Sheets, and Calendar access

### 2. Gmail

- Create a label: `Leads-Inbound`
- Set a Gmail filter to auto-label incoming lead emails
- In Make.com: watch for emails with label `Leads-Inbound`

### 3. Make.com — Scenario 1 (Gmail trigger)

1. **Gmail** module → Watch Emails → label: `Leads-Inbound`
2. **Text Parser** (Match Pattern) ×4 — one per field:

| Field | Regex Pattern |
|-------|---------------|
| Phone | `(?:Phone\|Tel\|Mobile)[:\s]+([\d\s\-\(\)\+]{7,15})` |
| Name | `(?:Name\|From)[:\s]+([A-Za-z ]+)` |
| Email | `([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})` |
| Service | `(?:Service\|Type)[:\s]+(.+?)(?:\n\|$)` |

3. **HTTP POST** to `https://api.retellai.com/v2/create-phone-call`

```json
{
  "from_number": "YOUR_RETELL_NUMBER",
  "to_number": "{{lead_phone}}",
  "agent_id": "YOUR_AGENT_ID",
  "retell_llm_dynamic_variables": {
    "customer_name": "{{lead_name}}",
    "service": "{{lead_service}}"
  }
}
```

### 4. Retell AI Agent

- Create agent named `Booking Assistant`
- Set post-call webhook URL → your Make.com webhook URL
- Use this prompt template:

```
You are a friendly booking assistant calling on behalf of [BUSINESS NAME].
Collect: preferred date, time, service type, and full name.
Confirm the booking before ending the call.
Tell the customer they'll receive an SMS confirmation shortly.
```

### 5. Make.com — Scenario 2 (Webhook receiver)

Triggered by Retell AI's post-call webhook.

1. **Google Sheets** → Add a Row → Bookings sheet
2. **Google Calendar** → Create Event
3. **Twilio** → Send SMS

#### Google Sheets columns

| Column | Variable |
|--------|----------|
| Timestamp | `{{now}}` |
| Name | `{{webhook.call_analysis.custom_data.customer_name}}` |
| Phone | `{{webhook.to_number}}` |
| Service | `{{webhook.call_analysis.custom_data.service}}` |
| Booking Date | `{{webhook.call_analysis.custom_data.booking_date}}` |
| Booking Time | `{{webhook.call_analysis.custom_data.booking_time}}` |
| Call Status | `{{webhook.call_status}}` |

#### SMS template

```
Hi {{customer_name}}! Your booking with [BUSINESS NAME] is confirmed.

Service: {{service}}
Date: {{booking_date}}
Time: {{booking_time}}

Questions? Call us at [YOUR PHONE].
See you soon!
```

---

## ✅ Testing Checklist

- [ ] Send test email → apply `Leads-Inbound` label manually
- [ ] Verify Make.com Scenario 1 fires and parses all fields
- [ ] Confirm Retell AI places a call to your test number
- [ ] Go through the booking conversation with the AI agent
- [ ] Verify Scenario 2 webhook receives post-call data
- [ ] Check new row in Google Sheets
- [ ] Check Google Calendar event created at correct time
- [ ] Confirm SMS received on test phone

---

## 🔧 Customization

Everything is editable without code:

| What | Where |
|------|-------|
| AI agent script / tone | Retell AI → Agents → Edit Prompt |
| SMS message | Make.com → Twilio module → Message Body |
| Services list | Retell AI prompt + Sheets headers |
| Gmail trigger criteria | Make.com → Gmail module |
| Business hours filter | Add a Router + Filter in Make.com before the call |
| View all bookings | Open the Bookings Google Sheet |
| Review call recordings | Retell AI → Calls |

---

## 🚀 Optional Enhancements (Post-MVP)

- **No-answer retry** — if call status is `no-answer`, delay and retry via Make.com
- **Business hours filter** — Router module blocks calls outside working hours
- **Reminder SMS** — second scenario reads Sheets and sends reminders 24h before
- **Lead scoring** — OpenAI module scores leads before deciding to call
- **Slack alerts** — notify your team on every new confirmed booking
- **CRM sync** — connect to HubSpot, Pipedrive, or Airtable

---

## 🔐 Environment Variables / Credentials

Store all secrets in a password manager. Never commit them to this repo.

| Secret | Where to find it |
|--------|-----------------|
| `RETELL_API_KEY` | Retell AI → Settings → API Keys |
| `RETELL_AGENT_ID` | Retell AI → Agents → click agent → URL |
| `RETELL_PHONE_NUMBER` | Retell AI → Phone Numbers |
| `TWILIO_ACCOUNT_SID` | Twilio Console → Dashboard |
| `TWILIO_AUTH_TOKEN` | Twilio Console → Dashboard |
| `TWILIO_PHONE_NUMBER` | Twilio Console → Phone Numbers |
| `MAKE_WEBHOOK_URL` | Make.com → Webhooks → copy URL |

---

## 📁 Repo Contents

```
/
├── README.md                          # This file
├── docs/
│   ├── AI_Lead_Booking_Guide.docx     # Full build guide (non-technical)
│   └── make_text_parser_guide.jsx     # Interactive step-by-step React guide
├── prompts/
│   └── retell_agent_prompt.txt        # AI agent system prompt template
└── sheets/
    └── bookings_template.csv          # Google Sheets column template
```

---

## 📄 License

MIT — free to use, modify, and deploy for your own business.

---

## 🙋 Support

If a step isn't working, check the [Troubleshooting section](docs/AI_Lead_Booking_Guide.docx) in the full guide, or open an issue in this repo.
