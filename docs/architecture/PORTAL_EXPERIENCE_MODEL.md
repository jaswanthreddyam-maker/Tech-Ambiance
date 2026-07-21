# Portal Experience Specification (v1.0 FROZEN)

This specification defines the product experience of the Client Portal, transitioning it from a collection of raw data widgets into a curated, action-driven journey.

## 1. The Core Philosophy

- **Desktop optimizes for Analysis:** Information density, deep dives into billing, full document reviews, and comprehensive project overviews.
- **Mobile optimizes for Action & Decisions:** Scanning updates, approving invoices, grabbing a credential quickly, or joining a meeting.
- **Data vs Experience:** Clients don't want "Timeline" and "Milestones". They want to know *"What's happening?"* and *"When is it done?"* The portal must compose raw data into these answers.

## 2. The Experience Answers

### Home Experience
* **What is the first thing a client should notice within 3 seconds?**
  Their current progress. A bold, unmistakable indicator of where they are in the project lifecycle (e.g., "72% Complete — In Development").
* **What is the single most important KPI?**
  Time to Next Milestone. Clients care about momentum.
* **What is today's primary action?**
  Surfaced dynamically. If an invoice is pending, the primary action is "Pay Invoice". If a design needs approval, it's "Review Design". If nothing is pending, it's "Book a Sync".

### Project Resources
* **Ranked by frequency of use (Mobile):**
  1. Updates / Feed (What changed?)
  2. Credentials (I need the staging password right now)
  3. Deliverables (I need to see the latest design)
  4. Invoices (I need to pay)
  5. Environments (I need to check the live site)

### Timeline & Updates
* **Chronological or Grouped?**
  Grouped by day (e.g., "Today", "Yesterday", "Last Week") to feel like a modern feed rather than a server log.
* **Visibility?**
  Strictly client-visible events only. Internal tasks and technical minutiae (unless explicitly shared) must remain hidden to avoid overwhelming the client.

### Notifications
* **Representation:**
  An unread badge on the "Updates" tab (mobile) or a notification bell (desktop). The feed itself acts as the notification history.

### Meetings
* **Dynamic Display:**
  The "Book Consultation" button shouldn't be static. 
  - If a meeting is scheduled: *"Next Sync: Tomorrow at 2 PM"* (with a Join Link).
  - If no meeting is scheduled: *"Book a Sync"*.

### Premium Empty States
Instead of "No documents", the system should set expectations:
- **Documents:** *"We're preparing your deliverables. You'll be notified when the first files are ready for review."*
- **Timeline:** *"Your project has kicked off. Activity will appear here as our team begins work."*
- **Environments:** *"Infrastructure is being provisioned. Your staging links will appear here soon."*

---

## 3. The Builder Architecture (Phase C7.9)

To deliver this experience, we must insert an **Experience Builder Layer** between the Portal Service and the UI. Builders aggregate raw data into "View Models" tailored for specific experiences.

### The Home Builder (`HomeExperienceBuilder`)
Aggregates data from `projects`, `milestones`, `timeline`, and `invoices` into a single `HomeExperienceDTO`:

```ts
interface HomeExperienceDTO_v1 {
  greeting: string;               // "Good Morning, Jeshu"
  hero: {
    projectName: string;
    progressPercentage: number;
    currentStage: string;
  };
  primaryAction: {
    label: string;                // e.g., "Pay Overdue Invoice"
    href: string;
    urgency: 'high' | 'normal';
  } | null;
  nextMilestone: PortalMilestone | null;
  latestUpdate: PortalTimelineItem | null;
  upcomingMeeting: PortalMeeting | null;
}
```

### The UI Shift
- **Desktop Dashboard:** A curated layout prioritizing the Hero, Primary Action, and a unified Feed, alongside secondary resource panels.
- **Mobile Home Screen:** A vertical, single-column flow: Greeting → Hero → Primary Action Button → Latest Update Card → Next Milestone Card.
