PDFFILE=$1

cat > run_split_job.sge <<EOF
#!/bin/bash
##PBS -V
#PBS -l nodes=1:ppn=1,walltime=16:00:00
##PBS -l partition=beacon
#PBS -l advres=condo-staff.13772923
#PBS -A ACF-STA0001
#PBS -l qos=staff
#PBS -N $PDFFILE
#PBS -o log/\$PBS_JOBNAME-o\$PBS_JOBID
#PBS -e log/\$PBS_JOBNAME-e\$PBS_JOBID


cd \$PBS_O_WORKDIR

module load anaconda2/4.4.0 pdftk
module load tesseract

TOOL_DIR=/lustre/haven/proj/STA0001/junwenli/louise/tools-test

echo "started at " \`date\`

sh \$TOOL_DIR/check_bookmark.sh $PDFFILE

if  [[ \$? == 0 ]]; then
    \$TOOL_DIR/test_gopdf $PDFFILE
else
    ntotal=\`pdftk $PDFFILE dump_data | grep NumberOfPages | awk '{print \$2}'\`
    mkdir split.dir.$PDFFILE
    cp $PDFFILE split.dir.$PDFFILE/b0_1_\$ntotal.pdf
fi

echo "completed! at " \`date\`
EOF

qsub run_split_job.sge
