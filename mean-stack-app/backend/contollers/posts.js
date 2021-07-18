const Post = require('../models/post');

exports.createPost = (req, res, next)=>{
  const url = req.protocol + "://" + req.get("host");
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    imagePath: url + "/images/" + req.file.filename,
    creator: req.userData.userId
  });
  post.save().then(result=>{
    res.status(201).json({
      message: "Post added successfully",
      post: {
        ...result,
        id: result._id,
      }
    });
  }).catch(error => {
    res.status(500).json({
      message: "Post creation failed"
    });
  });
}


exports.updatePost = (req, res, next)=>{
  let imagePath = req.body.imagePath;
  if(req.file){
    const url = req.protocol + "://" + req.get("host");
    imagePath = url + "/images/" + req.file.filename
  }
  const post = new Post({
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content,
    imagePath: imagePath,
    creator: req.userData.userId
  })
  Post.updateOne({_id: req.params.id, creator: req.userData.userId }, post).then(result => {
    if(result.n > 0){
      res.status(200).json({
        message: 'Update successful'
        });
    }else{
      res.status(401).json({
        message: 'Not Authorized'
        });
    }
  }).catch(error => {
    res.status(500).json({
      message: "Couldn't Update Post"
    });
  });
}

exports.getPosts = (req, res, next)=>{
  const pageSize = +req.query.pageSize;
  const currentPage = +req.query.page;
  const postQuery = Post.find();
  let fetchedPost;
  if (pageSize && currentPage){
    postQuery.skip(pageSize*(currentPage - 1)).limit(pageSize);
  }
  postQuery.then(documents=>{
    fetchedPost = documents;
    return Post.count();
  }).then(count=>{
    res.status(200).json({
      message: 'Posts fetched successfully',
      posts: fetchedPost,
      maxPosts: count
    });
  }).catch(error => {
    res.status(500).json({
      message: "Fetching Posts Failed"
    });
  });
}


exports.getPost = (req, res, next)=>{
  Post.findById(req.params.id).then(post=>{
    if(post){
      res.status(200).json(post);
    }else{
      res.status(404).json({message: 'Post not Found'});
    }
  }).catch(error => {
    res.status(500).json({
      message: "Fetching Post Failed"
    });
  });
}

exports.deletePost = (req, res, next)=>{

  Post.deleteOne({_id: req.params.id, creator: req.userData.userId}).then(result=>{
    if(result.n > 0){
      res.status(200).json({
        message: 'Deletion successful'
        });
    }else{
      res.status(401).json({
        message: 'Not Authorized'
        });
    }
  }).catch(error => {
    res.status(500).json({
      message: "Fetching Post Failed"
    });
  });
}