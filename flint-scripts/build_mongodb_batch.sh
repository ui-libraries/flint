#!/bin/bash

#module load pymongo

WORKDIR=$1

for pdfsplit in $WORKDIR
do
    if [ -d "$pdfsplit" ] && [[ "$pdfsplit" == "split"* ]]; then
	
	dbname=`echo $pdfsplit | cut -d '.' -f 3`

	echo $dbname
	
        echo $pdfsplit

        cd $pdfsplit
	

        for txtdir in `ls -l | sort -t'_' -n -k2`; do
	
	   bookmarkno=`echo $txtdir | cut -d '.' -f 2 | cut -d '_' -f 1`	   
	   
           if [ -d "$txtdir" ]; then
               
               echo " ---- " $dbname $bookmarkno $txtdir/txt.total

	       python /lustre/haven/proj/UTK0077/tools-test/addmongobookmark.py $dbname $bookmarkno $txtdir/txt.total

	       
           fi

        done
        
        cd ..

    fi
done
