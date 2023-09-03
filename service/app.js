const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const app = express();
const PORT = 3000;

let listPosts = fs.readFileSync(path.resolve(__dirname, 'data.json'), 'utf-8');
listPosts = JSON.parse(listPosts); 

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));

// Posts
app.get('/api/posts', (req, res) => {
    return res.status(200).json({
       data: listPosts
    });
});

// Add a new post
app.post('/api/posts', (req, res) => {
    const newPost = req.body;
    newPost.id = `post${ Math.floor(Math.random() * 100000)}`; // Generate a new unique ID
    if (!newPost.comments) {
      newPost.comments = []; // Initialize comments if not provided
    }
    listPosts.push(newPost);
    fs.writeFileSync(path.resolve(__dirname, 'data.json'), JSON.stringify(listPosts, null, 2));
    return res.status(201).json({
      message: 'Post added successfully',
      post: newPost
    });
  });
  
// Update a post
app.put('/api/posts/:postId', (req, res) => {
    const postId = req.params.postId;
    const updatedPost = req.body;
    // Find the post in listPosts and update its content
    const postIndex = listPosts.findIndex(post => post.id === postId);
    if (postIndex !== -1) {
        listPosts[postIndex] = { ...listPosts[postIndex], ...updatedPost };
        fs.writeFileSync(path.resolve(__dirname, 'data.json'), JSON.stringify(listPosts, null, 2));
        return res.status(200).json({
            message: 'Post updated successfully',
            post: listPosts[postIndex]
        });
    } else {
        return res.status(404).json({
            message: 'Post not found'
        });
    }
});

// Delete post
app.delete('/api/posts/:postId', (req, res) => {
    const postId = req.params.postId;
    // Find and delete the post with the specified ID
    const deletedPostIndex = listPosts.findIndex(post => post.id === postId);
    if (deletedPostIndex !== -1) {
        listPosts.splice(deletedPostIndex, 1);
        fs.writeFileSync(path.resolve(__dirname, 'data.json'), JSON.stringify(listPosts, null, 2));
        return res.status(204).json({});
    } else {
        return res.status(404).json({
            message: 'Post not found'
        });
    }
});

// Add a comment to a post
app.post('/api/posts/:postId/comments', (req, res) => {
    const postId = req.params.postId;
    const newComment = req.body;
    // Find the post in listPosts and add the comment to its comments array
    const postIndex = listPosts.findIndex(post => post.id === postId);
    if (postIndex !== -1) {
        if (!listPosts[postIndex].comments) {
            listPosts[postIndex].comments = [];
        }
        listPosts[postIndex].comments.push(newComment);
        fs.writeFileSync(path.resolve(__dirname, 'data.json'), JSON.stringify(listPosts, null, 2));
        return res.status(201).json({
            message: 'Comment added successfully',
            comment: newComment
        });
    } else {
        return res.status(404).json({
            message: 'Post not found'
        });
    }
});

// 404 page not found
app.use('*', (req, res) => {
    return res.status(404).json({
        message: 'Page not found'
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});
