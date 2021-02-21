#!/bin/bash
command=$1
echo $command

VERSION='1.0.0'
IMAGE_NAME='frontend'
PROJECT_HOST='gcr.io'
PROJECT_ID='above-the-clouds-app'
HOST_IMAGE=${PROJECT_HOST}/${PROJECT_ID}/${IMAGE_NAME}

if [ "$command" == "build" ]; then
  echo 'STOPPING container...'
  docker container stop $(docker container ls -al | grep $IMAGE_NAME | awk 'END {print $1}')
  echo
  echo 'REMOVING container...'
  docker container rm $(docker container ls -al | grep $IMAGE_NAME | awk 'END {print $1}')
  echo
  echo 'DELETING image...'
  docker image rm $(docker images | grep $IMAGE_NAME | awk 'END {print $3}')
  echo
  echo 'BUILDING image...'
  docker build -t $IMAGE_NAME:$VERSION .
  echo
  # Run container locally:
  docker run -p 3000:3000 -d $IMAGE_NAME:$VERSION
fi

if [ "$command" == "push" ]; then
  # Push image to GCS Docker Container Registry
  echo 'PUSHING to container registry...'
  docker tag $IMAGE_NAME:$VERSION $HOST_IMAGE:$VERSION
  docker push $HOST_IMAGE:$VERSION
fi
