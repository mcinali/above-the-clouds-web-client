#!/bin/bash
command=$1
echo $command

if [ "$command" == "deploy" ]; then
  echo 'DEPLOYING to GKE cluster...'
  kubectl delete deployment.apps/frontend
  kubectl apply -f gke/deployment.yaml
fi
