# Parsedom Assignment In Node - Raksha Karn

I tried to make the assignment I did in Scrapy python using nodejs and as per instructions I went to Crawlee docs where I found Cheerio to be best for current use case as it is also very good for scraping static-like websites similar to scrapy.

You can find the scraped data in storage/datasets/default folder.

## Project Setup and Running

- Make sure you have node and npm in your computer.
- Clone this repository using `git clone https://github.com/Raksha-Karn/parsedom_assignment_node.git`
- Install the required packages using `npm install`
- Run the code using `npm start`
- After the code has completed running, you can see the final result in storage/datasets/default folder.

## How It Works

- Step 1: For pagination, I found out that the URL for the next page can be found by adding the page number to the URL's query parameter like '?page=2'.
- Step 2: I ran an infinite loop until I reached the page where the next page button has the 'disabled' property.
- Step 3: After pagination is done, I get the URL for the detail page in each listings page using the CSS selector.
- Step 4: In the details page, for each required property, I use CSS selector, Xpath and regex to get the data.

## My Other Scraping projects

- RemoteOk Scraper - This scraper scrapes https://remoteok.com using Selenium. [Link to the repository](https://github.com/Raksha-Karn/Remote-Ok-Scraper)

- CoinMarketCap Scraper - This scraper scrapes https://coinmarketcap.com using Scrapy. [Link to the repository](https://github.com/Raksha-Karn/CoinMarketCap-Scraper)

- LinkedIn Scraper - This scraper scrapes https://linkedin.com using Selenium. [Link to the repository](https://github.com/Raksha-Karn/InScraper)

- Reddit Scraper - This scraper scrapes https://reddit.com using Scrapy. [Link to the repository](https://github.com/Raksha-Karn/Reddit-Scraper)
