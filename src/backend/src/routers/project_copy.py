from fastapi import FastAPI, Response, status, HTTPException, Depends, APIRouter
#from fastapi.params import Body
from typing import List
#Database definitions
from sqlalchemy.orm import Session
from .. import models#,utils, schemas, oauth2
from ..database import get_db

router = APIRouter(
    prefix="/projects",
    tags=["projects"]
)

@router.get("/", response_model=List[schemas.Post_Display])
def get_posts(db: Session = Depends(get_db), current_user = Depends(oauth2.get_current_user)):
#    cur.execute("""SELECT * FROM posts""")
 #   posts = cur.fetchall()
    # print(current_user.email)
    posts = db.query(models.Post).all()

    return posts  #fastapi will convert list of dict into JSON automatically

@router.get("/{id}")
def get_post(id: int, response: Response, db: Session = Depends(get_db)):  #fastapi will automatically try to convert id, a passedover str, to int. If conversion failed, user will know what's wrong
    #cur.execute(""" SELECT * FROM posts WHERE ID = %s """, (id, ))
    #post = cur.fetchone()
    
    post = db.query(models.Post).filter(models.Post.id == id).first()

    if(post == None):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found") #cleaner way of returning a status code with customized msg
        #response.status_code = status.HTTP_404_NOT_FOUND  # Each response comes with a response obj. Updates on its status code will be reflected at user side. 
        #return {"post detail:": "not found"}
    else:
        return {"post detail:": post}


#Body is a fastapi function that supposedly returns the body of a post request.
# Inside the body is the content that client fills out 

@router.post("/", status_code=status.HTTP_201_CREATED, response_model=schemas.Response_Post)    #the status_code parameter defines the default status code of the response
#def create_post(payload: dict = Body(...)): #this grabs body data of request from Body(...). One needs to validate the body so that the back end can proceed to processing. One can do this easily with Pydantic 
def create_post(user_input: schemas.Post,  db: Session = Depends(get_db), current_user = Depends(oauth2.get_current_user)): 
    #cur.execute(""" INSERT INTO posts (title, content, published) VALUES (%s, %s, %s) RETURNING *; """, (user_input.title, user_input.content, user_input.published))
    #new_post = cur.fetchone()  
    #conn.commit() 
    #print(new_post.model_dump())    #a model_dump(), previously dict(), will convert a Pydantic model into a dictionary in python

    new_post = models.Post(owner_id = current_user.id, **user_input.model_dump())

    
    db.add(new_post)
    db.commit()
    db.refresh(new_post)

    return new_post 

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(id: int, db: Session = Depends(get_db), current_user = Depends(oauth2.get_current_user) ):
    #cur.execute(""" DELETE FROM posts WHERE id = %s RETURNING""", (id, ))
    #deleted_post = cur.fetchone()
    #conn.commit()
    post_query = db.query(models.Post).filter(models.Post.id == id)
    post = post_query.first()
    
    if post == None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                           detail="post not found")

    if post.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail= 'unauthorized operations')

    
    post_query.delete(synchronize_session=False) #default config, most stable
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.put("/{id}")
def update_post(id: int, user_input: schemas.Post, db: Session = Depends(get_db), current_user = Depends(oauth2.get_current_user)):
    #cur.execute(""" UPDATE posts SET title = %s, content = %s, published = %s WHERE id = %s RETURNING *""", (user_input.title, user_input.content, user_input.published, id))
    #updated_post = cur.fetchone()
    #conn.commit()

    query_post = db.query(models.Post).filter(models.Post.id == id)
    post = query_post.first()

    if query_post.first() == None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="post not found")

    if post.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="unauthorized operation")


    query_post.update(user_input.model_dump(), synchronize_session=False)
    db.commit()
    return {"message": "update successful", "data": query_post.first()}