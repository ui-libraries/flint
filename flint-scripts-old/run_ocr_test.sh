PDFFILE=$1
FILELIST=$2

FULLLIST=$PDFFILE/$FILELIST
cat > run_ocr_job.sge <<EOF

echo \`cat $FULLIST\`

xdfafre
EOF
