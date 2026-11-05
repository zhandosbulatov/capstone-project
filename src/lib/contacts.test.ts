import { describe, expect, it } from "vitest";
import { applyReply, applyStepDone, createContact, setContactStage } from "./contacts";
import { completeDailyStep, createGame, recordStage, titleFor } from "./game";

const ana = createContact({ name: " Ana ", relation: "friend", note: " knows my work " }, 1, "a");

describe("contacts", () => {
  it("creates a listed contact", () => {
    expect(ana).toMatchObject({ id: "a", name: "Ana", note: "knows my work", stage: "listed", followUps: 0 });
  });

  it("message, follow-up and propose move the contact", () => {
    let { contacts, change } = applyStepDone([ana], { kind: "message", contactId: "a" }, 2, "Hi Ana");
    expect(change).toEqual({ from: "listed", to: "messaged" });
    expect(contacts[0]).toMatchObject({ stage: "messaged", lastActionDay: 2, lastSent: "Hi Ana" });

    ({ contacts, change } = applyStepDone(contacts, { kind: "follow-up", contactId: "a" }, 5));
    expect(change).toBeUndefined();
    expect(contacts[0]).toMatchObject({ followUps: 1, lastActionDay: 5, lastSent: "Hi Ana" });

    ({ contacts } = setContactStage(contacts, "a", "call", 6));
    ({ contacts, change } = applyStepDone(contacts, { kind: "propose", contactId: "a" }, 7));
    expect(change).toEqual({ from: "call", to: "proposal" });
    expect(contacts[0].followUps).toBe(0);
  });

  it("a reply never moves backwards and waits for an answer", () => {
    const atCall = setContactStage([ana], "a", "call", 3).contacts;
    const { contacts, change } = applyReply(atCall, "a", "Sounds good", "replied", 4);
    expect(change).toBeUndefined();
    expect(contacts[0]).toMatchObject({ stage: "call", awaitingAnswer: true, lastReply: "Sounds good" });

    const answered = applyStepDone(contacts, { kind: "answer", contactId: "a" }, 4).contacts;
    expect(answered[0].awaitingAnswer).toBe(false);

    const no = applyReply([ana], "a", "Not now", "not-now", 4).contacts;
    expect(no[0]).toMatchObject({ stage: "not-now", awaitingAnswer: false });
  });
});

describe("game stubs", () => {
  it("completeDailyStep counts the streak once per day", () => {
    const once = completeDailyStep(createGame()).state;
    expect(once.streak).toBe(1);
    expect(completeDailyStep(once).state).toBe(once);
  });

  it("recordStage turns real events into results and titles", () => {
    let game = createGame();
    game = recordStage(game, "listed", "messaged").state;
    expect(game.results).toEqual([]);
    game = recordStage(game, "messaged", "replied").state;
    expect(titleFor(game)).toBe("sideStarter");
    game = recordStage(game, "replied", "proposal").state;
    expect(game.results.map((r) => r.type)).toEqual(["firstReply", "callBooked", "proposalSent"]);
    expect(titleFor(game)).toBe("freelancer");
    game = recordStage(game, "proposal", "paid").state;
    expect(titleFor(game)).toBe("consultant");
    expect(game.results.every((r) => r.proof === "self")).toBe(true);
  });

  it("recordStage records nothing for not-now or moving back", () => {
    const game = createGame();
    expect(recordStage(game, "messaged", "not-now").state).toBe(game);
    expect(recordStage(game, "call", "replied").state.results).toEqual([]);
  });
});
