if (window.location.href.match(/\/book\/show\//)) {
    main();
}

async function main(){
    const summaryDiv = document.createElement('div');
    summaryDiv.id = 'review-consensus';
    summaryDiv.style.lineHeight = '1.37';

    const contentContainerDiv = document.createElement('div');
    contentContainerDiv.className = 'TruncatedContent__text TruncatedContent__text--large';
    contentContainerDiv.setAttribute('data-testid', 'contentContainer');

    const detailsLayoutRightParagraph = document.createElement('div');
    detailsLayoutRightParagraph.className = 'DetailsLayoutRightParagraph';

    const widthConstrainedDiv = document.createElement('div');
    widthConstrainedDiv.className = 'DetailsLayoutRightParagraph__widthConstrained';

    

    // Create the bold text
    const boldText = document.createElement('strong');
    boldText.className = 'Formatted';
    boldText.innerText = 'Review Consensus';

    // Create the normal text
    const normalText = document.createElement('p');
    normalText.className = 'Formatted';
    normalText.id = 'review-consensus-text'; // For dynamically updating the text
    normalText.innerText = 'Generating...';

    // Assemble the structure
    widthConstrainedDiv.appendChild(boldText);
    widthConstrainedDiv.appendChild(normalText);
    detailsLayoutRightParagraph.appendChild(widthConstrainedDiv);
    contentContainerDiv.appendChild(detailsLayoutRightParagraph);
    summaryDiv.appendChild(contentContainerDiv);

    // Append the div to the page
    const bookSummaryElement = document.querySelector('.BookPageMetadataSection__description');

    // Insert the div right after the book summary
    if (bookSummaryElement) {
        bookSummaryElement.parentNode.insertBefore(summaryDiv, bookSummaryElement.nextSibling);
    }


    // Get reviews
    let reviews = await getReviews();

    const englishRegex = /^[A-Za-z0-9.,!?;:'"(){}\[\]\s]*$/;
    reviews = reviews.filter(str => englishRegex.test(str));
    // Send reviews to background for processing
    chrome.runtime.sendMessage({reviews: reviews}, function(response) {
        normalText.innerText = response.consensus;
    });
}

async function getReviews(){
    await sleep(1000); // Wait for the reviews to load

    // Find the starting point for community reviews
    const communityReviewsStart = document.querySelector('#CommunityReviews');
    if (!communityReviewsStart) {
        await sleep(1000);
    }

    // Get all elements after the community reviews section
    let currentElement = communityReviewsStart.nextElementSibling;
    const reviews = [];

    // Traverse the DOM until we run out of siblings or reach the end of the review section
    while (currentElement) {
        const reviewTexts = Array.from(currentElement.querySelectorAll('.ReviewText__content .TruncatedContent__text .Formatted'))
            .map(el => el.innerText.trim());

        reviews.push(...reviewTexts);

        currentElement = currentElement.nextElementSibling;
    }

    // If no reviews were found, wait and retry
    if (reviews.length === 0) {
        await sleep(1000);
        return await getReviews();
    }

    return reviews;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }