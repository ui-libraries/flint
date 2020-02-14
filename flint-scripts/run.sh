PDFFILE=$1

cat > run_job.sge <<EOF
#!/bin/bash
##PBS -V
#PBS -l nodes=1:ppn=1,walltime=16:00:00
##PBS -l partition=beacon
#PBS -l advres=condo-staff.13772923
#PBS -A ACF-STA0001
#PBS -l qos=staff
#PBS -N $PDFFILE

cd \$PBS_O_WORKDIR

module load anaconda2/4.4.0 pdftk
module load tesseract

for pdf in $PDFFILE
do
/usr/bin/time -f "%e" sh /lustre/haven/proj/STA0001/junwenli/louise/tools-test/splitpdf2txt.sh  \${pdf} >& log.\${pdf} 
done
EOF

qsub run_job.sge
