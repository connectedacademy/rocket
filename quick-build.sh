#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "Auto Update UI Mode"
GIT_REF="master"

# mkdir /repos
# cd /repos
# git clone git@github.com:connectedacademy/elevator.git
# echo "Cloned Elevator UI"
# cd elevator
# git fetch origin
# git reset --hard ${GIT_REF}
# echo "Switched to commit @ $GIT_REF"

# echo "Building elevator..."
# cd /repos/elevator
# npm i --silent
# npm run build
# echo "Build Complete"

# cd $DIR
# cp -r /repos/elevator/docs/* ~/connectedacademy
# echo "Copied UI to local repo"

cd ~/connectedacademy
# upgrade changes
git config --global user.name "CircleCI"
git config --global user.email "info@connectedacademy.io"
git checkout -b staging
git add .
git commit -am"[skip CI] AUTOBUILD"
git checkout -b gh-pages
git rebase -Xtheirs staging
git push -u -f origin gh-pages