#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Elevator branch
echo $ELEVATOR_BRANCH
echo $1
if [ $ELEVATOR_BRANCH ]
then
    echo "$ELEVATOR_BRANCH branch found"
    GIT_REF=$ELEVATOR_BRANCH
else
    echo "Auto Update UI Mode"
    GIT_REF="master"
fi

mkdir /repos
cd /repos
git clone git@github.com:connectedacademy/elevator.git
echo "Cloned Elevator UI"
cd elevator
git fetch origin
git reset --hard ${GIT_REF}
echo "Switched to commit @ $GIT_REF"

# Brand Customisation
cd $DIR
if [ -z `find branding -type f` ]
then
    echo "Using Stock brand"
else
    echo "Using Brand customisation"
    cp -R ~/connectedacademy/branding/stylus/* /repos/elevator/src/assets/stylus/buildvariant/
    cp -R ~/connectedacademy/branding/images/* /repos/elevator/src/assets/images/
    cp -R ~/connectedacademy/branding/fonts/* /repos/elevator/src/assets/fonts/
    cp -R ~/connectedacademy/branding/components/* /repos/elevator/src/components/
    cp -R ~/connectedacademy/branding/static/* /repos/elevator/static/

    cd /repos/elevator
    npm i --silent
    npm run build
    echo "Build Complete"
fi

cd $DIR
cp -r /repos/elevator/docs/* ~/connectedacademy
echo "Copied UI to local repo"

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