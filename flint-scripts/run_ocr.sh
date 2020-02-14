PDFFILE=$1
FILELIST=$2

cat > run_ocr_job.sge <<EOF
#!/bin/bash
##PBS -V
#PBS -l nodes=1:ppn=1,walltime=200:00:00
##PBS -l partition=beacon
#PBS -l advres=condo-staff.13772923
#PBS -A ACF-STA0001
#PBS -l qos=staff
#PBS -N ${PDFFILE}-${FILELIST}
#PBS -o log/\$PBS_JOBNAME-o\$PBS_JOBID
#PBS -e log/\$PBS_JOBNAME-e\$PBS_JOBID


cd \$PBS_O_WORKDIR

module load anaconda2/4.4.0 pdftk
module load tesseract

echo "started at " \`date\`

sh /lustre/haven/proj/STA0001/junwenli/louise/tools-test/ocr.sh $PDFFILE $FILELIST

echo "completed at " \`date\`

EOF

qsub run_ocr_job.sge
