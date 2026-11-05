// The 9 short lessons, copied from the lesson files in
// ai-business-coach/2026-11-05-claude-code-prompts/lessons/. Generated once; edit with care.
// Unlock rules live in next-step.ts; this file holds only content.

import type { Lesson, LessonId } from "./model";

/** The order lessons unlock and are checked in. */
export const LESSON_ORDER: LessonId[] = [
  "m0-safe",
  "m1-offer",
  "m2-package",
  "m3-outreach",
  "m4-sales",
  "m5-proposal",
  "m6-deliver",
  "m7-money",
  "l2-beyond",
];

export const LESSONS: Record<LessonId, Lesson> = {
  "m0-safe": {
    "id": "m0-safe",
    "title": "Safe to start",
    "minutes": 3,
    "readOnly": true,
    "unlockText": "Unlocks after Day 1",
    "body": [
      "Most employers allow side work. Some limit it, and a few ask you to tell them first. The rules usually live in three places: your employment contract, the employee handbook, and any policy on conflicts of interest. Read them once, before your first message, so you never have to wonder about it again.",
      "Look for five kinds of clause. Outside work, sometimes called moonlighting: it may ask for permission or disclosure. Conflict of interest: usually no work for competitors, or for your employer's clients and suppliers. Intellectual property: what you create on company time, with company equipment, or close to the company's business may belong to your employer. Confidentiality: client lists, data and internal documents stay at work. Non-compete and non-solicitation: limits on working for competitors or approaching your employer's clients and staff, sometimes even after you leave. How strictly these apply depends on your country, your state and the exact wording.",
      "Then set your own rules and keep them. Work on your own time. Use your own laptop, phone, email and accounts, never work ones. Don't sell to your employer's clients, suppliers or competitors. Don't use anything confidential, not even a \"cleaned-up\" file. Your experience is yours; your employer's documents are not.",
      "If your contract asks you to disclose outside work, disclosing a small, unrelated service is often simpler than hiding it. If a clause is unclear, or your service sits close to what your employer sells, ask HR or an employment lawyer before you start. This lesson is general information, not legal advice."
    ],
    "keyPoints": [
      "Read your contract, the handbook and the conflict-of-interest policy once.",
      "Check five clauses: outside work, conflict of interest, IP, confidentiality, non-compete.",
      "Own time, own devices, own accounts. No employer clients, suppliers or competitors.",
      "Unclear clause or a service close to your employer's business: ask HR or a lawyer first."
    ],
    "links": []
  },
  "m1-offer": {
    "id": "m1-offer",
    "title": "Your offer and your proof",
    "minutes": 3,
    "readOnly": false,
    "unlockText": "Unlocks after your first 2 messages",
    "body": [
      "A good offer fits in one sentence: who it's for, what they get, and the price. \"I help local cafés look professional online: a logo, a color palette and five social templates, for $450.\" The test is simple. Could a friend repeat it to someone else without you in the room? If not, it's too long or too vague.",
      "Name one kind of buyer. \"Local cafés and salons\" works better than \"small businesses\", because you can picture them, they know each other, and your messages get easier to write. Narrow now, widen later. A narrow offer is also easier to recommend: people remember the designer who does cafés.",
      "Your best work is probably under NDA, or it belongs to your employer. You don't need the files. You need a proof line: what you did and what changed, with no names. \"At my day job I run the brand for a 40-store retail chain.\" \"I cut monthly reporting from six days to one for a finance team.\" Numbers and scope beat adjectives. \"Experienced and passionate\" proves nothing; \"40 stores\" does.",
      "Never show your employer's files, logos, client names or internal numbers, even to a friend. Describe the size and the result in your own words. If you can't say it without revealing something confidential, pick a different example."
    ],
    "keyPoints": [
      "One sentence: who, what they get, price.",
      "One kind of buyer you can picture.",
      "Proof line: what you did and what changed, with a number, no names.",
      "Never show employer files, logos or client names."
    ],
    "decision": {
      "intro": "Write the three lines Hugin will use in every message from now on.",
      "fields": [
        {
          "id": "offer",
          "label": "Your offer in one sentence",
          "placeholder": "I help local cafés look professional online: a logo, colors and 5 social templates, for $450.",
          "help": "Who it's for, what they get, the price."
        },
        {
          "id": "buyer",
          "label": "Who buys",
          "placeholder": "Independent cafés and salons in my city",
          "help": "One kind of buyer you can picture."
        },
        {
          "id": "proof",
          "label": "Your proof line",
          "placeholder": "At my day job I run the brand for a 40-store retail chain.",
          "help": "What you did and what changed. A number helps. No names."
        }
      ],
      "usedFor": "Hugin uses your offer, buyer and proof line in every message and proposal."
    },
    "links": []
  },
  "m2-package": {
    "id": "m2-package",
    "title": "Your package and price",
    "minutes": 4,
    "readOnly": false,
    "unlockText": "Unlocks when someone replies, or after 5 messages",
    "body": [
      "Clients buy a thing with edges, not your time. A package says what's included, what isn't, how long it takes and how many rounds of changes they get. The edges protect your evenings. A $450 job without edges quietly becomes a $450 job that takes thirty hours.",
      "Set the price with three quick checks. First, the market: look at three freelancers who sell something similar and note their prices. Second, your hours: estimate how long the package takes, divide the price by the hours, and ask whether you'd accept that rate. If not, raise the price or cut the scope. Third, the client's side: what is the result worth to them? Start where the three checks overlap. It's a starting price, and you'll raise it after the first clients.",
      "Decide your payment terms before anyone asks. Half upfront and half on delivery is common and fair: you don't start without commitment, and they don't pay everything before they see work. For small jobs, full payment upfront is also normal. Put the terms in the proposal, not in an awkward message later.",
      "When someone asks \"how much?\", answer in one line: the price and what's included. Then ask a question. \"It's $450 for a logo, colors and five social templates, delivered in two weeks. What's the main thing you'd want it to fix?\" Don't apologize, and don't offer a discount nobody asked for. If the price is too much for them, offer a smaller scope, not a lower price."
    ],
    "keyPoints": [
      "Package = what's in, what's out, timeline, rounds of changes.",
      "Price: check the market, your hours and their value.",
      "Terms decided upfront: 50% before, 50% on delivery, or full upfront for small jobs.",
      "\"How much?\": price and scope in one line, then a question. Cut scope, not price."
    ],
    "decision": {
      "intro": "Define the package Hugin will offer when someone asks about price.",
      "fields": [
        {
          "id": "scope",
          "label": "What's included",
          "placeholder": "Logo, color palette, 5 social templates. Delivered in 2 weeks, 2 rounds of changes.",
          "help": "3–5 items, the timeline and the rounds of changes.",
          "multiline": true
        },
        {
          "id": "notIncluded",
          "label": "What's not included",
          "placeholder": "Website, printing, extra templates",
          "help": "The add-ons people will ask for."
        },
        {
          "id": "price",
          "label": "Price",
          "placeholder": "$450",
          "help": "One number."
        },
        {
          "id": "terms",
          "label": "Payment terms",
          "placeholder": "50% to start, 50% on delivery",
          "help": "When they pay."
        }
      ],
      "usedFor": "Hugin uses your package when someone asks about price, and in every proposal."
    },
    "links": []
  },
  "m3-outreach": {
    "id": "m3-outreach",
    "title": "Finding the next people",
    "minutes": 3,
    "readOnly": false,
    "unlockText": "Unlocks when your list is nearly empty",
    "body": [
      "People who have seen your work answer. Strangers mostly don't. That's why every message so far went to someone who knows you. Your list is bigger than it feels. Think in groups: colleagues from every past job, former managers, people from school or courses, friends who run something, past freelance clients, local businesses where you're a regular, and everyone who has ever asked you for a favor in your field.",
      "A good warm message is about them first, mentions your service in one line, and ends with an easy question. Not \"Would you be interested?\" but \"Who's looking after your branding these days?\" One person at a time, in a private channel: text, WhatsApp, personal email or a direct message. Nothing public, and nothing your employer will see.",
      "Silence usually means busy, not no. The app reminds you to follow up after three days, and once more after that. Then it lets the person rest. Two polite nudges are helpful; a third starts to feel like pressure.",
      "Your network has a network. The fastest way to new names is to ask someone well connected: \"Do you know one person who runs a café and might want a fresh look?\" One specific ask gets an answer. \"Let me know if you hear of anything\" never does."
    ],
    "keyPoints": [
      "Think in groups: past jobs, school, friends with businesses, places you're a regular.",
      "About them first, the service in one line, an easy question.",
      "Private channels only. Two follow-ups, then let it rest.",
      "Ask one well-connected person for one specific introduction."
    ],
    "decision": {
      "intro": "Decide where your next names come from, and who you'll ask for an introduction.",
      "fields": [
        {
          "id": "groups",
          "label": "Where your next 10 names come from",
          "placeholder": "My last two jobs, my design course group, cafés I go to",
          "help": "Two or three groups.",
          "multiline": true
        },
        {
          "id": "connector",
          "label": "One person who knows many of your buyers",
          "placeholder": "Dana, who manages the coworking space downtown",
          "help": "Someone well connected to the people you sell to."
        }
      ],
      "usedFor": "Hugin reminds you of your groups when you add people, and drafts your introduction ask to your connector."
    },
    "links": []
  },
  "m4-sales": {
    "id": "m4-sales",
    "title": "The 15-minute call",
    "minutes": 3,
    "readOnly": false,
    "unlockText": "Unlocks when you book your first call",
    "body": [
      "A short call is a diagnosis, not a pitch. You're finding out whether you can help, and they're finding out whether they trust you. Fifteen minutes is enough: two minutes to catch up, eight minutes on their situation, three minutes on what you'd do and what it costs, and two minutes to agree the next step.",
      "The middle eight minutes are questions. What isn't working right now? What have they already tried? What would good look like in three months? Who else decides, and by when? Listen far more than you talk, and write down their exact words. You'll use them in the proposal, and they'll recognize their own problem.",
      "When you describe what you'd do, link it to what they said. \"You said new customers don't find you on Instagram. The package gives you five templates you can post every week.\" Then name the price once, plainly, and stop talking. The pause after the price belongs to them.",
      "Never end a call with \"let me know\". End with a next step and a date: \"I'll send a one-page proposal tomorrow. Can we speak on Friday to decide?\" If it's clearly not a fit, say so kindly and ask whether they know someone it would fit. A clean no with a referral is a good call."
    ],
    "keyPoints": [
      "2 minutes catch-up, 8 their situation, 3 your idea and price, 2 the next step.",
      "Ask, listen, write down their words.",
      "Name the price once, then stop talking.",
      "Always end with a next step and a date."
    ],
    "decision": {
      "intro": "Prepare the three questions you'll ask, and how you'll close.",
      "fields": [
        {
          "id": "q1",
          "label": "Question 1",
          "placeholder": "What isn't working with how customers see you right now?",
          "help": "About their problem."
        },
        {
          "id": "q2",
          "label": "Question 2",
          "placeholder": "What have you already tried?",
          "help": "About what they've done."
        },
        {
          "id": "q3",
          "label": "Question 3",
          "placeholder": "What would good look like three months from now?",
          "help": "About the result they want."
        },
        {
          "id": "close",
          "label": "Your closing line",
          "placeholder": "I'll send a one-page proposal tomorrow. Can we speak Friday to decide?",
          "help": "A next step and a date."
        }
      ],
      "usedFor": "Hugin uses your questions to prepare you for each call, and your closing line when it answers replies."
    },
    "links": []
  },
  "m5-proposal": {
    "id": "m5-proposal",
    "title": "Proposal and agreement",
    "minutes": 4,
    "readOnly": false,
    "unlockText": "Unlocks after the call lesson, once you have a call booked",
    "body": [
      "Send the proposal within a day of the call, while it's fresh. One page is enough: their problem in their own words, what they get (your package), the timeline, the price stated once, the payment terms, and how to say yes. \"Reply yes and I'll send the invoice today.\" Make yes the easiest thing to do.",
      "Even with a friend, put the deal in writing. For a small job, a clear email they reply \"yes\" to can be enough; for anything bigger, use a short written agreement. Either way, it should say what's included, the timeline and what you need from them, the price and when it's paid, how many rounds of changes are included and what extra work costs, who owns the final work and from when, and what happens if either side cancels. Writing it down is not distrust. It's how friendships survive business.",
      "Ownership is a common surprise. A typical approach is that the client owns the final work once they've paid in full, and you keep the right to show it in your portfolio unless they say no. Decide what you want before you send the proposal.",
      "When they say yes, send the invoice the same day and start after the deposit arrives. Simple templates for proposals and service agreements are easy to find. For larger or unusual jobs, have a lawyer look at your agreement once. This lesson is general information, not legal advice."
    ],
    "keyPoints": [
      "Proposal within 24 hours: their problem, the package, timeline, price, terms, how to say yes.",
      "Put every deal in writing, even with friends.",
      "Agreement: scope, timeline, price and payment, changes, ownership, cancellation.",
      "Invoice on the day of yes; start after the deposit."
    ],
    "decision": {
      "intro": "Set the three terms Hugin will add to every proposal and agreement.",
      "fields": [
        {
          "id": "changes",
          "label": "Changes rule",
          "placeholder": "2 rounds of changes included; extra rounds $60 each",
          "help": "What's included, and what extra costs."
        },
        {
          "id": "ownership",
          "label": "Who owns the work",
          "placeholder": "The final files are yours once the last payment is in. I may show the work in my portfolio unless you say no.",
          "help": "When the work becomes theirs.",
          "multiline": true
        },
        {
          "id": "cancellation",
          "label": "If someone cancels",
          "placeholder": "If you cancel after we start, the deposit covers the work done so far.",
          "help": "What happens to payments."
        }
      ],
      "usedFor": "Hugin adds these terms to every proposal and agreement it drafts for you."
    },
    "links": []
  },
  "m6-deliver": {
    "id": "m6-deliver",
    "title": "Deliver and get proof",
    "minutes": 3,
    "readOnly": false,
    "unlockText": "Unlocks when your first client pays",
    "body": [
      "Your first client is also your first portfolio piece and your first referral. Start well. On the day they pay, send a short kickoff message: what happens next, what you need from them, and the date they'll see the first version. Clients remember the start more than the finish.",
      "Plan the work around your job, not into it. Pick two or three fixed evening or weekend slots a week, and set the delivery date with a few days of buffer. Keep to the rules from the first lesson: your own time, your own devices, nothing from work. Halfway through, send a two-line update even if nobody asked. Silence makes clients nervous; a short update makes you look organized.",
      "Deliver on time and a little better than promised: a cleaner file, a short guide on how to use what you made. Better, not bigger. Extra scope you give away for free becomes the expectation next time.",
      "Ask for a review on the day you deliver, while they're happy. Make it easy: two or three sentences, and one specific question such as \"What changed for you after this?\" Then ask whether you may describe the project, with no confidential details: the problem, what you did, the result. That short story is your proof line for the next client."
    ],
    "keyPoints": [
      "Kickoff message on payment day: next steps, what you need, first date.",
      "Fixed work slots outside your job, a delivery date with buffer, a midway update.",
      "Deliver better, not bigger.",
      "Ask for a review on delivery day, and permission to describe the project."
    ],
    "decision": {
      "intro": "Plan this delivery so Hugin can write your kickoff and review messages.",
      "fields": [
        {
          "id": "slots",
          "label": "When you'll work on it",
          "placeholder": "Tuesday and Thursday evenings, Saturday morning",
          "help": "Fixed slots outside your job."
        },
        {
          "id": "delivery",
          "label": "Delivery date",
          "placeholder": "Friday, November 27",
          "help": "Include a few days of buffer."
        },
        {
          "id": "reviewAsk",
          "label": "Your review question",
          "placeholder": "What changed for you after the new look went live?",
          "help": "One specific question."
        }
      ],
      "usedFor": "Hugin writes your kickoff message and your review request from these."
    },
    "links": []
  },
  "m7-money": {
    "id": "m7-money",
    "title": "Money basics for your first payment",
    "minutes": 3,
    "readOnly": true,
    "unlockText": "Unlocks after the delivery lesson",
    "body": [
      "Money from your side service is income. In most countries you need to report it, even when it's small, and even though your employer already takes tax from your salary. The rules differ by country, change often, and depend on your situation, so treat this lesson as a checklist of questions, not answers.",
      "Start four habits with your first payment. Keep the money separate, in its own account or at least clearly tagged. Log every payment and every business expense with the date. Keep your invoices and receipts. And set aside a share of each payment for tax, so the bill is never a surprise; an accountant can tell you what share fits your situation.",
      "In the United States, income from self-employment is generally reported on your annual tax return and may also be subject to self-employment tax. If you expect to owe enough, you may need to pay estimated tax during the year, and business clients may send you a 1099 form. In the United Kingdom, you may need to register for Self Assessment with HMRC and report your side income, and there's a trading allowance for small amounts of trading income that may or may not apply to you. Check the official IRS or GOV.UK guidance, or ask an accountant.",
      "You usually don't need a company to take your first client. Many people start as a sole proprietor in the US or a sole trader in the UK. Whether to form an LLC or a limited company is a question for later, when income grows or you want more protection, and it's one for an accountant or lawyer. Don't let paperwork delay the work. This lesson is general information, not tax or legal advice."
    ],
    "keyPoints": [
      "Side income is income. Check how to report it where you live.",
      "From payment one: a separate account, a log, receipts, money set aside for tax.",
      "US: tax return, possibly self-employment tax and estimated payments. UK: possibly Self Assessment and the trading allowance.",
      "A company can wait. Ask an accountant when it matters."
    ],
    "links": []
  },
  "l2-beyond": {
    "id": "l2-beyond",
    "title": "From one client to the next",
    "minutes": 3,
    "readOnly": false,
    "unlockText": "Unlocks after the money lesson",
    "body": [
      "One client can be luck. Two is the start of a system. You now have something you didn't have a month ago: a real project, a review and a story. Use all three for the next client.",
      "Raise your price for the next client. Your first price was a starting price, chosen to get the first yes. New clients only ever see the new price, so nobody feels a change. A step up of around a fifth is a common move once you have a finished project and a review; your three price checks from the package lesson still apply.",
      "Ask for referrals on purpose. Your happy client knows people like them, and so do the friends who've seen your work. Ask each one for one introduction to one kind of person: \"Do you know another café owner who'd want this?\" Specific asks get names; general ones get \"sure, I'll keep an eye out\".",
      "Two more doors to try. A second channel: pick a few local businesses you don't know, and send each three specific observations about their page or process, with no pitch. Value first, then a question. And repeat work: is there a monthly version of your service, like four new social templates a month? Repeat clients make side income steadier than chasing a new client every month."
    ],
    "keyPoints": [
      "New clients get a new, higher price.",
      "Ask specific people for one specific introduction.",
      "Second channel: three useful observations, no pitch.",
      "Look for a monthly version of your service."
    ],
    "decision": {
      "intro": "Set up your next round.",
      "fields": [
        {
          "id": "nextPrice",
          "label": "Price for your next client",
          "placeholder": "$550",
          "help": "Your new starting price."
        },
        {
          "id": "referrals",
          "label": "Who you'll ask for an introduction",
          "placeholder": "Maria (my first client), Tom from my design course",
          "help": "Two names."
        },
        {
          "id": "monthly",
          "label": "A monthly version of your service",
          "placeholder": "4 new social templates every month for $180",
          "help": "Optional idea; write \"not yet\" if none."
        }
      ],
      "usedFor": "Hugin uses your new price in proposals and drafts your referral asks."
    },
    "links": []
  },
};

/** Review notes for Hugin only. Not shown in the app. */
export const HUGIN_NOTES: Record<LessonId, string> = {
  "m0-safe": "If the user asks about a specific clause, a specific employer or whether they are \"allowed\", don't answer yes or no. Say it's one for HR or an employment lawyer, and point them back to this lesson. Never say \"you're fine\" or \"that's legal\".",
  "m1-offer": "When reviewing:\n- **Offer:** has a buyer, a concrete deliverable and a price, in one sentence.\n- **Buyer:** one specific type, not \"small businesses\" or \"anyone\".\n- **Proof:** has a number or a concrete scope. Has no employer name, client name or anything that sounds confidential. Remove such details in the improved version and say why in the feedback.",
  "m2-package": "When reviewing:\n- **Scope:** concrete items, a timeline and a number of revisions.\n- **Not included:** names real add-ons.\n- **Price:** a single number. If it seems very low for the scope, say so plainly, but never mention income potential.\n- **Terms:** say when payment happens.",
  "m3-outreach": "When reviewing:\n- **Groups:** real, specific groups, not \"everyone I know\".\n- **Connector:** a named person, plus why they know the buyers.\n\nNever suggest public posting, cold mass messaging or contacting people through the employer's channels.",
  "m4-sales": "When reviewing:\n- **Questions:** open (not yes/no), about the client and not about the user's service.\n- **Close:** names a concrete next step and a day. Replace \"let me know\" with a dated step.",
  "m5-proposal": "When reviewing, check that each term is clear and specific, and that it's fair to both sides. Don't present any wording as legally binding or legally sufficient. If the user asks whether a term is enforceable, say it's one for a lawyer.",
  "m6-deliver": "When reviewing:\n- **Slots:** outside normal working hours.\n- **Delivery date:** realistic, with buffer.\n- **Review question:** specific and about the client's result, not about the user.",
  "m7-money": "Never calculate tax, name a tax rate, or say whether the user must register or pay. Point them to the official IRS or GOV.UK guidance or an accountant. Never estimate income.",
  "l2-beyond": "When reviewing:\n- **Next price:** higher than the current price. If not, ask why, plainly.\n- **Referrals:** named people.\n- **Monthly version:** concrete deliverable and price, or \"not yet\". Never estimate income.",
};
