
import { Injectable } from "@angular/core";
import { Post } from "./post.model"
import { Subject } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { map } from 'rxjs/operators';
import { Title } from "@angular/platform-browser";
import { Router } from "@angular/router";
import { environment } from "src/environments/environment";

const BACKEND_URL = environment.apiUrl + '/posts/';

@Injectable({providedIn:'root'})
export class PostsService{
  private posts: Post[] = [];
  private postUpdated = new Subject<{posts: Post[], postsCount: number}>();

  constructor(private httpClient: HttpClient, private router: Router){

  }

  getPosts(postsPerPage: number, currentPage: number){
    const queryParams = `?pageSize=${postsPerPage}&page=${currentPage}`;
    this.httpClient.get<{message: string, posts: any, maxPosts: number}>(BACKEND_URL + queryParams)
    .pipe(map(postData =>{
      return { posts: postData.posts.map( post => {
        return{
          id: post._id,
          title: post.title,
          content: post.content,
          imagePath: post.imagePath,
          creator: post.creator
        };
      }), maxPosts: postData.maxPosts};
    }))
    .subscribe(transformedpostData=> {
      console.log(transformedpostData);
      this.posts = transformedpostData.posts;
      this.postUpdated.next({posts: [...this.posts], postsCount: transformedpostData.maxPosts});
    });
  }

  getPostUpdateListener(){
    return this.postUpdated.asObservable();
  }

  getPost(id: string){
    return this.httpClient.get<{_id: string; title: string; content: string; imagePath: string; creator: string;}>(BACKEND_URL + id);
  }

  addPost(title: string, content: string, image: File){
    const postData = new FormData();
    postData.append("title", title);
    postData.append("content", content);
    postData.append('image', image, title);
    this.httpClient.post<{message: string, post: Post}>(BACKEND_URL, postData).subscribe( responseData =>{
      this.router.navigate(['/']);
    });

  }

  updatePost(id: string, title: string, content: string, image: File | string){
    let postData: Post | FormData;
    if(typeof(image)=='object'){
      postData = new FormData();
      postData.append("id", id);
      postData.append("title", title);
      postData.append("content", content);
      postData.append("image", image, title);
    }else{
      postData = {id: id, title: title, content: content, imagePath: image, creator: null};
    }
    this.httpClient.put(BACKEND_URL + id, postData).subscribe(response => {
      this.router.navigate(['/'])
    });
  }
  deletePost(postId: string){
    return this.httpClient.delete(BACKEND_URL + "/" + postId);
  }
}
