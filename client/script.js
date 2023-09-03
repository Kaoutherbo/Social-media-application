const postsListElement = document.querySelector('.posts-list');
const url = 'https://social-media-app-4hdx.onrender.com/api/posts';
let posts= [];


const createPostDom = (id,img) => {
    const post = document.createElement('div');
    post.classList.add('post');
    post.id = id;
    post.innerHTML = `<img src="${img}">`;
    return post;
}


(
    async function () {
        try {
            const postData = await fetch(`${url}`);
            posts = await postData.json();
            posts.data.forEach((post) => {
                postsListElement.appendChild(createPostDom(post.id, post.img));
            });

        } catch (err) {
            console.error(err.message);
        }
    }
)(posts , createPostDom);

//popup post
const popupPost=document.querySelector('.popup-post');
const postContainer=document.querySelector('.popup-container');

popupPost.onclick = (event) => {
    let isClickInside = postContainer.contains(event.target);

    if (!isClickInside) {
      popupPost.style.display='none';
    }
}

//create popup
const createPopup=document.querySelector('.create-popup');
const createContainer=document.querySelector('.create-container');
const createBtn=document.querySelector('.create');

createBtn.onclick = (event) =>{ createPopup.style.display='grid';}

createPopup.onclick = (event) => {
    let isClickInside = createContainer.contains(event.target);

    if (!isClickInside) {
      createPopup.style.display='none';
    }
}

//like
let isLiked =false;
const likeBtn=document.querySelector('.like-btn');
const likeIcon=document.querySelector('.like');
const likedIcon=document.querySelector('.liked');

likeBtn.addEventListener('click',()=>{
    if(!isLiked){
        likeIcon.style.display='none';
        likedIcon.style.display='block';
    }
    else{
        likeIcon.style.display='block';
        likedIcon.style.display='none';
    }
    isLiked=!isLiked;
})

//create a post
const submit=document.querySelector('#submit');

const submitEvent = async () => {
    const title = createPopup.querySelector('#title').value;
    const image = createPopup.querySelector('#img').value;
    const description = createPopup.querySelector('#description').value;
    if(title==''|| image=='') return alert("error")
    await fetch(`${url}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title:title,img:image,description:description})
    });

    location.reload();
}

submit.addEventListener('click', async () => {
    await submitEvent();
});

// button enter click
submit.addEventListener('keyup', async (e) => {
    if (e.keyCode === 13) {
        await submitEvent();
    }
});

//menu
const menu=document.querySelector('.menu-popup');
const menuContainer=document.querySelector('.menu-container');
const menuBtn=document.querySelector('#menu-btn');

menuBtn.onclick = (event) =>{ menu.style.display='grid';}

menu.onclick = (event) => {
    let isClickInside = menuContainer.contains(event.target);

    if (!isClickInside) {
      menu.style.display='none';
    }
}

// To display the posts from main

const main = document.querySelector('.main');

main.addEventListener('click', (event) => {
  const post = event.target.closest('.post');
  if (post) {
    const postId = post.id;
    const selectedPost = posts.data.find((p) => p.id === postId);
    if (selectedPost) {
      displayPostDetails(selectedPost);
      popupPost.style.display = 'grid';
    }
  }
});

let currentPostId;


  
// Delete a post
const deleteBtn = document.querySelector('#delete-btn')

deleteBtn.addEventListener('click', async () => {
    
    if (!currentPostId) {
        console.error('Post ID is missing or invalid.');
        return;
    }

    try {
        const response = await fetch(`${url}/${currentPostId}`, {
            method: 'DELETE'
        });

        location.reload();
       
    } catch (error) {
        console.error('Error occurred while deleting the post:', error);
    }
});

//update a post
const updateBtn=document.querySelector('#update-btn');
const updatePopup=document.querySelector('.update-popup');
const updateContainer=document.querySelector('.update-container');
const Update=document.querySelector("#update");

updateBtn.onclick = () =>{ 
    updatePopup.style.display='grid';
    menu.style.display='none';
    updatePopup.querySelector('#title').value=popupPost.querySelector('.post-comments > .title').textContent;
    updatePopup.querySelector('#img').value=popupPost.querySelector('.post-img > img').src;
    updatePopup.querySelector('#description').value=popupPost.querySelector('.post-comments > .description').textContent;
}

updatePopup.onclick = (event) => {
    let isClickInside = updateContainer.contains(event.target);

    if (!isClickInside) {
      updatePopup.style.display='none';
    }
}

const updateEvent = async () => {
    const title = updatePopup.querySelector('#title').value;
    const image = updatePopup.querySelector('#img').value;
    const description = updatePopup.querySelector('#description').value;
    if(title==''|| image=='') return alert("error");
   
    await fetch(`${url}/${currentPostId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title:title,img:image,description:description})
    });

    location.reload();
}

Update.addEventListener('click', async () => {
    await updateEvent();
});

// post btn click
const postButton = document.getElementById('post');
postButton.addEventListener('click', async () => {
  
  const commentInput = document.getElementById('comment');
  const comment = commentInput.value.trim();

  if (comment !== '') {
    await addComment(currentPostId, comment);
    commentInput.value = '';
  }
});

//Add comment function
async function addComment(postId, commentText) {
    try {
        const response = await fetch(`${url}/${postId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: commentText }), 
        });

        if (response.status === 201) {
            const post = posts.data.find((p) => p.id === postId);
            post.comments.push({ text: commentText }); 
            displayPostDetails(post); 
        } else if (response.status === 404) {
            console.error('Post not found.');
        } else {
            console.error('Error adding comment. Status:', response.status);
        }
    } catch (error) {
        console.error('Error adding comment:', error);
    }
}


//Delete comment function

async function deleteComment(postId, commentIndex) {
  try {
    const response = await fetch(`${url}/${postId}/comments/${commentIndex}`, {
      method: 'DELETE',
    });

    if (response.status === 204) {
      const post = posts.data.find((p) => p.id === postId);
      post.comments.splice(commentIndex, 1);
      displayPostDetails(post);
    } else if (response.status === 404) {
      console.error('Post or comment not found.');
    } else {
      console.error('Error deleting comment. Status:', response.status);
    }
  } catch (error) {
    console.error('Error deleting comment:', error);
  }
}


function displayPostDetails(post) {
    const postImg = document.getElementById('post-img');
    const postTitle = document.getElementById('post-title');
    const postDescription = document.getElementById('post-description');
    const commentsSection = document.querySelector('.comments');

    postImg.src = post.img;
    postTitle.textContent = post.title;
    postDescription.textContent = post.description;

    commentsSection.innerHTML = ''; 

    if (post.comments && post.comments.length > 0) {
        post.comments.forEach((comment) => {
            const commentElement = document.createElement('div');
            commentElement.textContent = comment.text; 
            commentsSection.appendChild(commentElement);
        });
    }

    currentPostId = post.id;
}
