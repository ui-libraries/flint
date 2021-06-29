rm -f filelist
touch filelist
for f in `ls -rt`; do
    if [[ $f == b* ]]; then
	echo $f >> filelist
    fi
done

python /lustre/haven/proj/UTK0077/original_pdf_files_and_text/split_list.py filelist
#split -l 50 -d --numeric-suffixes=1 filelist list-
