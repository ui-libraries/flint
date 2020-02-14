WORKDIR=split.dir.$1.pdf
for pdfsplit in $WORKDIR
do
    if [ -d "$pdfsplit" ] && [[ "$pdfsplit" == "split"* ]]; then

        echo $pdfsplit

        cd $pdfsplit

        for txtdir in *; do

	   if [ -d "$txtdir" ]; then
         
               echo " ---- " $txtdir 

               cd $txtdir
# combine all txt files
               for txt in `ls *.txt -1 | sort -t'_' -n -k1`; do
#                   echo "        ++ " $txt
		   cat $txt;
               done > txt.total

	       cd ..

           fi

        done
        
        cd ..

    fi
done
