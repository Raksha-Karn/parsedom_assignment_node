import { CheerioCrawler, Dataset, log } from "crawlee";
import fs from "fs";

const scraped_data = [];
const crawler = new CheerioCrawler({
  maxConcurrency: 5,

  requestHandlerTimeoutSecs: 60,

  async requestHandler({ request, $, crawler }) {
    const { label, page } = request.userData;

    if (label === "VENUE_LIST" || !label) {
      await handleVenueListPage($, request, crawler, page || 1);
    } else if (label === "VENUE_DETAIL") {
      await handleVenueDetail($, request);
    }
  },
});

async function handleVenueListPage($, request, crawler, currentPage) {
  log.info(`Processing page ${currentPage}: ${request.url}`);

  const venueUrls = [];
  const detailPageLinks = $("div.onWhenS div.venueCard--wrapper > a");
  for (let i = 0; i < detailPageLinks.length; i++) {
    const href = $(detailPageLinks[i]).attr("href");
    if (href) {
      venueUrls.push(href);
    }
  }

  log.info(`Found ${venueUrls.length} venues on page ${currentPage}`);

  if (venueUrls.length === 0) {
    log.warning(`No venue urls found on page ${currentPage}.`);
    return;
  }

  for (const url of venueUrls) {
    const fullUrl = new URL(url, request.url).href;
    await crawler.addRequests([
      {
        url: fullUrl,
        userData: { label: "VENUE_DETAIL" },
      },
    ]);
  }

  const nextButton = $('button[aria-label="Next Page"]');
  const isDisabled =
    nextButton.prop("disabled") || nextButton.attr("disabled") !== undefined;

  if (nextButton.length > 0 && !isDisabled) {
    const nextPage = currentPage + 1;
    const url = new URL(request.url);
    url.searchParams.set("page", nextPage.toString());
    const nextUrl = url.toString();

    await crawler.addRequests([
      {
        url: nextUrl,
        userData: {
          label: "VENUE_LIST",
          page: nextPage,
        },
      },
    ]);
  } else {
    log.info(`Pagination completed at page ${currentPage}`);
  }
}

async function handleVenueDetail($, request) {
  const venueTitle = $("div[itemType=venue-name]").text().trim() || "N/A";

  let venueNumber = "N/A";
  const rawNumber = $("div.styles--visibleMobile a#call-venue").attr("href");
  if (rawNumber) {
    const match = rawNumber.match(/tel:([\d-]+)/);
    if (match) {
      venueNumber = match[1].replace(/\D/g, "");
    }
  }

  const venueHighlights = [];
  const highlights = $("div.styles--visibleMobile div.VenueHighlights--label");
  for (let i = 0; i < highlights.length; i++) {
    const highlight = $(highlights[i]).text().trim();
    if (highlight) {
      venueHighlights.push(highlight);
    }
  }

  let venueCapacity = "N/A";
  const capacityHeader = $('h3:contains("Guest capacity:")');
  if (capacityHeader.length > 0) {
    const rawCapacity = capacityHeader.next("p").first().text().trim();
    if (rawCapacity) {
      const upToMatch = rawCapacity.match(/up to (\d+)/i);
      if (upToMatch) {
        venueCapacity = upToMatch[1];
      }
    }
  }

  let formattedAddress = "N/A";
  const locationHeader = $('h3:contains("Location:")');
  if (locationHeader.length > 0) {
    const venueAddress = locationHeader.next("p").first().text().trim();
    if (venueAddress) {
      formattedAddress = venueAddress;
    }
  }

  log.info(`Scraped venue: ${venueTitle}`);

  const data = {
    URL: request.url,
    "Venue name": venueTitle,
    Phone: venueNumber,
    "Venue highlights": venueHighlights,
    "Guest capacity": venueCapacity,
    Address: formattedAddress,
  };
  await Dataset.pushData(data);

  scraped_data.push(data);
}

await crawler.run([
  {
    url: "https://www.wedding-spot.com/wedding-venues/?pr=new%20jersey&r=new%20jersey%3anorth%20jersey&r=new%20jersey%3aatlantic%20city&r=new%20jersey%3ajersey%20shore&r=new%20jersey%3asouth%20jersey&r=new%20jersey%3acentral%20jersey&r=new%20york%3along%20island&r=new%20york%3amanhattan&r=new%20york%3abrooklyn&r=pennsylvania%3aphiladelphia&sr=1",
    userData: {
      label: "VENUE_LIST",
      page: 1,
    },
  },
]);

log.info("Crawling completed");
fs.writeFileSync("scraped_data.json", JSON.stringify(scraped_data));
