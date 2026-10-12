export type Reading = { id: string; label: string; unit?: string; optional?: boolean };

export type Item = {
  id: string;
  text: string;
  /** Temperature / numeric readings that belong to this task */
  readings?: Reading[];
  /** Pick-one answer (e.g. CO2 fill level) */
  choice?: { id: string; label: string; options: string[] };
  /** Task is a "record a reading" task – must be filled before it can be ticked */
  required?: boolean;
};

export type Section = { id: string; title: string; items: Item[] };

export type Checklist = {
  id: string;
  title: string;
  short: string;
  area: "FOH" | "BOH";
  when: "Opening" | "Closing";
  blurb: string;
  sections: Section[];
};

const temp = (id: string, label: string, optional = false): Reading => ({ id, label, unit: "°C", optional });

export const VERSION = "June 2026";

export const checklists: Checklist[] = [
  {
    id: "foh-opening",
    title: "FOH Opening Checklist",
    short: "FOH Opening",
    area: "FOH",
    when: "Opening",
    blurb: "Temps, booza, drinks, order & pickup, dining room, bins",
    sections: [
      {
        id: "temp",
        title: "Temp Checks*",
        items: [
          { id: "t1", text: "Record temperature* of cool rooms", required: true, readings: [temp("cr1", "Cool room 1"), temp("cr2", "Cool room 2 (if applicable)", true)] },
          { id: "t2", text: "Record temperature* of main freezer (Fries, Falafel)", required: true, readings: [temp("fz", "Freezer")] },
          { id: "t3", text: "Record temperature* of salad bar fridges", required: true, readings: [temp("lamb", "Lamb fridge"), temp("chicken", "Chicken fridge"), temp("fattoush", "Fattoush fridge")] },
          { id: "t4", text: "Record temperature* of fridge below chargrill", required: true, readings: [temp("charg", "Chargrill fridge")] },
          { id: "t5", text: "Record temperature* on booza display freezer and storage freezer", required: true, readings: [temp("disp", "Display freezer"), temp("stor", "Storage freezer")] },
        ],
      },
      {
        id: "booza",
        title: "Booza",
        items: [
          { id: "b1", text: "Load ice cream in the display freezer from the storage freezer using FIFO" },
          { id: "b2", text: "Gather and position ice cream scoopers, scraper and stainless 1/6 tray (for the dipper well)" },
          { id: "b3", text: "Fill water in the 1/6 tray and put scoopers in." },
          { id: "b4", text: "Refill ice cream cones, cups, foam trays, wooden spoon and napkins." },
          { id: "b5", text: "Gather and install pistachio tray and lid, and load with pistachio" },
          { id: "b6", text: "Position and replenish (if needed) tray of sprinkles (100s & 1000s)" },
        ],
      },
      {
        id: "drinks",
        title: "Drinks Fountain",
        items: [
          { id: "d1", text: "Restock cups, lids, straws, and cup trays." },
          { id: "d2", text: "Check status of CO2 bottle and record fill level*.", required: true, choice: { id: "co2", label: "CO2 fill level", options: ["Near empty", "1/4", "1/2", "3/4", "Full"] } },
          { id: "d3", text: "Fill the ice well." },
          { id: "d4", text: "Purge each drinks tap." },
          { id: "d5", text: "Confirm there are no empty drinks syrups." },
        ],
      },
      {
        id: "order",
        title: "Order and Pickup",
        items: [
          { id: "o1", text: "Check that bags, napkins, sticky POS paper, and receipt paper have been replenished." },
          { id: "o2", text: "Gather and position dine-in plates in designated area." },
          { id: "o3", text: "Prepare cutlery sets" },
          { id: "o4", text: "Record temperature* in drinks fridge and replenish if needed", required: true, readings: [temp("drinksfridge", "Drinks fridge")] },
          { id: "o5", text: "Confirm digital menu is on and correct" },
          { id: "o6", text: "Confirm paper menu is positioned" },
          { id: "o7", text: "Ensure printers, EFTPOS, kitchen monitor, POS is on and functioning" },
        ],
      },
      {
        id: "dining",
        title: "Dining Room",
        items: [
          { id: "r1", text: "Position tables and chairs as per set layout" },
          { id: "r2", text: "Wipe down all tables and chairs" },
          { id: "r3", text: "Unlock front door for opening" },
          { id: "r4", text: "Confirm digital menu is on and correct" },
          { id: "r5", text: "Confirm paper menu is positioned" },
          { id: "r6", text: "Confirm music is playing" },
        ],
      },
      {
        id: "bins",
        title: "Bins",
        items: [{ id: "n1", text: "Ensure external bins are wheeled into position." }],
      },
    ],
  },
  {
    id: "foh-closing",
    title: "FOH Closing Checklist",
    short: "FOH Closing",
    area: "FOH",
    when: "Closing",
    blurb: "Booza, drinks, order & pickup, dining room, tills, doors",
    sections: [
      {
        id: "booza",
        title: "Booza",
        items: [
          { id: "b1", text: "Cover booza and move ice cream from the display freezer to the storage freezer." },
          { id: "b2", text: "Clean/wipe the glass and any spills in or around the freezer. Keep freezer ON overnight." },
          { id: "b3", text: "Empty leftover pistachio from pistachio tray into sealed container and store for next day." },
          { id: "b4", text: "Take ice cream scoopers, scraper, pistachio bowl and stainless 1/6 tray in for dishwashing." },
        ],
      },
      {
        id: "drinks",
        title: "Drinks Fountain",
        items: [
          { id: "d1", text: "Wipe down taps with clean damp cloth." },
          { id: "d2", text: "Pour a jug of hot water down the drainage of the drinks fountain." },
          { id: "d3", text: "Rinse grate for drain, wipe down drain." },
          { id: "d4", text: "Replace any empty syrup boxes." },
          { id: "d5", text: "Wipe down storage bench for cup trays, then replenish." },
        ],
      },
      {
        id: "order",
        title: "Order and Pickup",
        items: [
          { id: "o1", text: "Restock bags, napkins, sticky POS paper, and receipt paper." },
          { id: "o2", text: "Gather and position dine-in plates in designated area." },
          { id: "o3", text: "Prepare available cutlery sets for next day." },
          { id: "o4", text: "Refill drinks fridge" },
          { id: "o5", text: "Empty all bins and throw out." },
          { id: "o6", text: "Close tills and complete z-report" },
          { id: "o7", text: "Check online orders for following day and notify management" },
          { id: "o8", text: "Wipe down table numbers with clean damp cloth." },
        ],
      },
      {
        id: "dining",
        title: "Dining Room",
        items: [
          { id: "r1", text: "Clear all tables." },
          { id: "r2", text: "Pack up all tables/chairs." },
          { id: "r3", text: "Ensure music is OFF at close." },
          { id: "r4", text: "Lock customer entry doors." },
          { id: "r5", text: "Replenish hand soap and paper towels on all customer wash basins and toilets for next day." },
        ],
      },
    ],
  },
  {
    id: "boh-opening",
    title: "BOH Opening Checklist",
    short: "BOH Opening",
    area: "BOH",
    when: "Opening",
    blurb: "Power on, shawarma, first cook, fries, wrap station, falafel",
    sections: [
      {
        id: "power",
        title: "Power On and Ignite",
        items: [
          { id: "p1", text: "Turn on all indoor lights" },
          { id: "p2", text: "Turn on exhaust" },
          { id: "p3", text: "Power on Franke chip dispenser" },
          { id: "p4", text: "Power on Fryers and ignite. Temp 175-180 deg" },
          { id: "p5", text: "Ignite Chargrill, set to max" },
          { id: "p6", text: "Ignite Hot Plate, set to 120 deg" },
          { id: "p7", text: "Power on Falafel Fryer, set to 170 deg" },
          { id: "p8", text: "Power on Prince castle PHU warmers" },
        ],
      },
      {
        id: "shawarma",
        title: "Shawarma",
        items: [
          { id: "s1", text: "Gather all shawarma machine equipment from dishwashing and install" },
          { id: "s2", text: "Load the lamb and chicken shawarma cones using the jack" },
          { id: "s3", text: "Decorate the meat with fruit/veg" },
          { id: "s4", text: "Ignite the grill and power on the motor for rotation" },
        ],
      },
      {
        id: "chicken",
        title: "First Cook - Chicken",
        items: [
          { id: "c1", text: "Set to high heat and position skewer in slot 3 (second last), then reduce bottom to low heat after 20 mins" },
          { id: "c2", text: "Reduce all burners to low heat after another 15 mins" },
        ],
      },
      {
        id: "lamb",
        title: "First Cook - Lamb",
        items: [{ id: "l1", text: "Set to high heat and position skewer in slot 3 (second last), then reduce all burners to low heat after 30 mins" }],
      },
      {
        id: "fries",
        title: "Fries",
        items: [
          { id: "f1", text: "Assemble and insert filter box" },
          { id: "f2", text: "Gather and position filtration equipment (brushes, skimmer etc.)" },
          { id: "f3", text: "Assemble and power on Chip warmer" },
          { id: "f4", text: "Load tubs in Franke chip dispenser and fill with fries" },
        ],
      },
      {
        id: "wrap",
        title: "Wrap Station",
        items: [
          { id: "w1", text: "Gather utensils and dividers from dishwashing. Assemble dividers into salad bar" },
          { id: "w2", text: "Load salad bars as per diagram, beginning with stock from trolley. [Use fresh pans for lettuce and parsley/onion]" },
          { id: "w3", text: "Position a fresh tray of bread near station" },
          { id: "w4", text: "Load rest of bread trays into the cool room" },
          { id: "w5", text: "Top up wrapping paper on salad bars" },
          { id: "w6", text: "Ensure Kitchen monitors/printers are on and functioning" },
          { id: "w7", text: "Add slice tomato on lamb grill to cook 15min before open" },
        ],
      },
      {
        id: "falafel",
        title: "Falafel",
        items: [
          { id: "x1", text: "Insert splash guard and frying basket." },
          { id: "x2", text: "Fry bread for fattoush" },
          { id: "x3", text: "Bag bread for Unwrapped" },
        ],
      },
    ],
  },
  {
    id: "boh-closing",
    title: "BOH Closing Checklist",
    short: "BOH Closing",
    area: "BOH",
    when: "Closing",
    blurb: "Replenish, store cold food, power off, dishwasher, discard",
    sections: [
      {
        id: "replenish",
        title: "Replenish and Clean (Last Hour)",
        items: [
          { id: "r1", text: "Restock packaging under shawarma bench. (Containers, lids etc.)" },
          { id: "r2", text: "Restock Chip Cups in Chip Warmer" },
          { id: "r3", text: "Fill up sauce containers for next day (garlic, tomato, chilli)." },
          { id: "r4", text: "Complete a daily filtration cycle on each Deep Fryer." },
        ],
      },
      {
        id: "cold",
        title: "Store Cold Food",
        items: [
          { id: "c1", text: "Place lids/cling wrap on all cold foods in Salad Bars (incl. fattoush bar)" },
          { id: "c2", text: "Place lids/cling wrap on all kafta/soujouk in Chargrill Fridge" },
          { id: "c3", text: "Load all trays and sauces from Salad Bars and Chargrill Fridge onto stainless trolley and store in Cool Room." },
          { id: "c4", text: "Close lid of Salad Bars to preserve temperature." },
          { id: "c5", text: "Transfer fries remaining in Chip Dispenser to the Main Freezer." },
        ],
      },
      {
        id: "off",
        title: "Power Off",
        items: [
          { id: "o1", text: "Turn off gas to all shawarma burners and power off motors." },
          { id: "o2", text: "Turn off Chargrill" },
          { id: "o3", text: "Turn off Hot Plate" },
          { id: "o4", text: "Power off Falafel Fryer" },
          { id: "o5", text: "Power off Prince Castle PHU's" },
        ],
      },
      {
        id: "dish",
        title: "Send to Dishwasher",
        items: [
          { id: "d1", text: "All utensils (spoons, tongs, scrapers etc.) from workstation to dishwashing" },
          { id: "d2", text: "Falafel Fryer splash guard and basket" },
          { id: "d3", text: "Chip Warmer tray and scoops" },
          { id: "d4", text: "Deep Fryer filtration equipment" },
          { id: "d5", text: "Deep Fryer filter box (ensuring it's empty first)" },
          { id: "d6", text: "Shawarma machine drip trays, skewers and side flaps" },
          { id: "d7", text: "Chip Dispenser tubs and stainless grates (from bottom)" },
        ],
      },
      {
        id: "discard",
        title: "Discard",
        items: [{ id: "x1", text: "Any bread leftover that wasn't in refrigerator" }],
      },
    ],
  },
];

export const getChecklist = (id: string) => checklists.find((c) => c.id === id);

export const allItems = (c: Checklist) => c.sections.flatMap((s) => s.items);
