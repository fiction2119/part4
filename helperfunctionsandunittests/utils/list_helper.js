// A simple function that logs the input (presumably an array of blog posts) and returns a fixed value.
const dummy = (blogs) => {
    console.log(blogs);
    return 1;
}

// Calculates the total number of likes across all blogs in the input array.
const totalLikes = (blogs) => {
    const sum = blogs.reduce((accumulator, blog) =>
        accumulator + blog.likes // Adds the number of likes from the current blog to the accumulator.
        , 0); // Starts counting from 0.
    return sum;
}

// Identifies the blog post with the highest number of likes.
const favoriteBlog = (blogs) => {
    if (!Array.isArray(blogs) || blogs.length === 0) { // Checks if the input is a valid non-empty array.
        console.log(JSON.stringify(blogs)); // Logs the input if it's empty or not an array.
        return []; // Returns an empty array in case of invalid input.
    }

    let favorite = blogs.reduce((acc, blog) => {
        return (acc.likes > blog.likes) ? acc : blog; // Compares each blog's likes, keeping the one with the most likes.
    }, blogs[0]); // Initializes the comparison with the first blog post.

    // Restructures the favorite blog to only include relevant details.
    favorite = [{
        title: favorite.title,
        author: favorite.author,
        likes: favorite.likes
    }];

    return favorite;
}

// Calculates which author has the most blog posts.
const mostBlogs = (blogs) => {
    // Creates a count of blogs per author.
    const authorBlogCounts = blogs.reduce((acc, blog) => {
        if (acc[blog.author]) {
            acc[blog.author] += 1; // Increments the count for this author.
        } else {
            acc[blog.author] = 1; // Initializes this author's count.
        }
        return acc;
    }, {});

    let maxBlogs = 0;
    let authorWithMostBlogs = '';

    // Identifies the author with the highest count of blogs.
    for (const author in authorBlogCounts) {
        if (authorBlogCounts[author] > maxBlogs) {
            maxBlogs = authorBlogCounts[author];
            authorWithMostBlogs = author;
        }
    }

    console.log(`Author with the most blogs: ${authorWithMostBlogs}, Number of blogs: ${maxBlogs}`);

    // Structures the result as an array containing an object with the author and their blog count.
    const mostBlogs = [{
        author: authorWithMostBlogs,
        blogs: maxBlogs
    }];

    return mostBlogs;
}

const mostLikes = (blogs) => {
    // Step 1: Aggregate likes per author
    const likesPerAuthor = blogs.reduce((acc, blog) => {
        if (acc[blog.author]) {
            acc[blog.author] += blog.likes;
        } else {
            acc[blog.author] = blog.likes;
        }
        return acc;
    }, {});

    // Step 2: Find the author with the maximum likes
    let maxLikes = 0;
    let authorWithMostLikes = '';
    for (const author in likesPerAuthor) {
        if (likesPerAuthor[author] > maxLikes) {
            maxLikes = likesPerAuthor[author];
            authorWithMostLikes = author;
        }
    }

    // Return an object containing the author with the most likes and the total number of likes
    return {
        author: authorWithMostLikes,
        likes: maxLikes
    };
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
}
