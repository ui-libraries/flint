# flint

documentation
Flint Email Project Documentation/Readme
Louise Seamster, 3/18/20 (not yet complete)

This project was conceptualized in 2016, was the subject of an Applied Research class in Fall 2017 and received some computational assistance in 2018-2019 at the University of Tennessee before becoming a collaborative project with the University of Iowa’s Digital Scholarship and Publishing Lab in Fall 2019. Below is technical information about the data and data management.

Original data archive:
The dataset was originally made available on Michigan’s website at http://www.michigan.gov/snyder/0,4668,7-277-57577_57657-376716--,00.html, where it is still online as of 3/17/20. It is stored on the state’s website in PDF format, with lengths ranging from one page to ____ pages. The PDF naming convention is according to the name of a state department (presumably responding to the FOIA request represented in the PDF). Some FOIA requests are included in the PDF, but most PDFs do not begin with this documentation. It appears that PDFs may be roughly grouped by email sender, implying that the sequencing of PDF numbers and within-PDF order may correspond with a) FOIA response by department and b) email sender. 
Department identification and acronyms are in Appendix A.

Additional cached data not in our dataset:
A student in 2018 noticed some additional archived versions of this website that had additional PDFs. Currently, the dataset we are working with has only the data that is currently available on the website, although we have one copy of the additional PDFs (rendered through OCR) available on the Google Drive in this folder. In a later stage of the process we can add these PDFs into the overall dataset. Many of the cached PDFs are scanned copies of handwritten notes or paper documents with handwriting in the margins, so they will be more complex to analyze anyway.

Email Structure: 
Because the email files are stored as PDFs rather than as Outlook exports or another format that retains structure, this complicates analysis in several ways. The first is  

OCR rendering:
Although we did not know this initially, some number of the PDF files were already rendered through OCR in their original presentation. We re-rendered every PDF through OCR. One version of OCR was employed by Haley Boles in 2017 for the version stored in Google Drive. The second iteration of OCR was done in 2018 by Junwen Li, this time employing binary erosion on the files prior to processing. Binary erosion refines the original image, and is especially useful for halftone renderings of fonts, usually present when the original was in color and the PDF is of a scanned/photocopied version of the file. 
In Spring 2019, a team of undergraduate Electrical Engineering and Computer Science students ran tests to refine the binary erosion rules for processing files and found a scale for binary erosion that improved text-rendering quality. Basically, binary erosion helps optical character recognition by darkening/thickening lines of characters, especially where they are represented in halftone with sparse pixels. We do not yet have an estimate of the overall OCR accuracy for the full dataset, in part because original data quality varies largely across pages: some pages have tables and forms, handwriting, logos, pictures, etc, or are scanned in, while most of the strictly email-based pages exported more directly have transferred with virtually 100% accuracy. The final erosion grid determined to best improve OCR quality was 3x3. 
The process for OCR rendering was as follows:
Splitting each PDF file by page-conversion to .png file
binary erosion
passing through OCR (using ___ package)
rendering OCR as separate text file

(image of process here)

Bookmarks:
Through experimentation, Haley Boles found that opening the PDFs in Adobe Acrobat Pro showed “bookmarks” dividing a majority of the emails within a larger PDF, probably due to a feature of compiling a PDF directly from an email client. The bookmarks are usually titled with the subject line of the email (although we have not used this feature yet). Haley used the bookmarks to divide the larger PDFs into smaller sections that roughly correspond with individual emails (or email chains, if they are threaded). When the emails were primarily being used on Google Drive, this facilitated analysis compared to wrangling one long PDF. On google drive, the naming convention, which includes bookmark number, is “deq #_Part####”. 

When creating individual text files for each PDF page, we retained the bookmark level in the file naming convention, because it is helpful to know the PDF name, the page number, and the bookmark number. If and when we have to train machine learning to find distinct emails,  bookmark information can comprise part of the algorithm.

Latent (mostly Word) attachments:
Probably due to differences in email exports, many attachments present sequentially within the larger PDF (e.g., email thread-attached document-email thread), but many others (usually .doc files) are nested inside a live hyperlink. These documents can be accessed through Adobe Acrobat Pro and collated within the PDF. The names of the documents can be matched to the hyperlinked name of the file, to keep them paired with their spot in the dataset (since they do not have a page assigned). At this time, we have not decided on a method of handling these files.

Database:
After some experimentation and consideration of the final needs and form of the website/analysis methodology, we are using MongoDB

Data storage:
The primary version of the files we are using is stored on Amazon Web Services: link. As of now, administrative access into AWS is somewhat limited due to University of Iowa rules. However, AWS also hosts a web version accessible by URL. Each text file is available on its own URL using the naming convention

PDF and PNG files are also available on AWS but we are not primarily employing them at the moment. In later stages we will be able to refer back to them for OCR correction, for reading more complex texts, and/or to have a link to the original page in PDF form for the website.

We have backups of the full dataset including text files on Louise Seamster’s LSS research allocation at the University of Iowa; at the Digital Scholarship and Publishing Studio; and.  . An earlier rendered version of the dataset, split by bookmark into folders representing each PDF (but without text files and representing an earlier iteration of OCR), is also available on Google Drive. This version has Bates numbers appended that match up with the page number of each text file, as they both correspond to the order of their appearance in the larger PDF.

Code
We are using Python Jupyter notebooks for organization, experimentation and data extraction. Code is stored on Github at https://github.com/ui-libraries/flint
Remote access to AWS and Github is available through this process:

Email recognition
Some algorithm: if a line matches some pattern (not a reg ex) that looks like the beginning
Paired with a certain distance from to and send, combined with a few other categories
Split test data into training and validation, check one by hand, run the scripts over the other, then compute the error rate. Then you can determine acceptable error rate.

Test Data


Text Extraction considerations
The next step in database construction, after each text file is created and named appropriately, is to start extracting data from the files to create key-value pairs representing the variables of key interest for database organization. Priorities include time stamps and named entity extraction.

Timestamps

Mapping out time stamps appears to be the best way to capture each individual email 
Abby Rinaldi has created time stamps

Named Entity extraction

Some libraries we are using: textparser, NLTK, 


Email duplicates
We have discussed a number of ways to identify duplicate emails. In general there are two ways a document could recur in the archive: if it was sent to multiple recipients whose emails were collected, or if it was included in a larger thread. Some emails or documents appear many times (probably over ten). 

Threading
Email structure analysis



Next steps, final goals
Paragraph on the project taken from AHI etc


Appendix A: Department acronyms
DEQ: Department of Environmental Quality
DHHS: Department of Health and Human Services
DNR: Department of Natural Resources
DOC
DTMB: Department of Transportation, Management and Budget
LARA
MSP: Michigan State Police
Michigan Civil Service Commission
TED
TIA
Treasury
Kevyn Orr and DWSD: this file is from Detroit’s emergency manager, Kevyn Orr, and DWSD is Detroit Water and Sewer Department (Flint’s prior water source)
