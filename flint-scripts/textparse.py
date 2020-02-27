import sys
import re

def remove_extra(line):
    line = line.replace('|','')
    start = line.index(":")+1
    end = -1

    line = line.replace('"', '')

    line = re.sub('\[.+?\]', '', line)
    line = re.sub('<.+?>', '', line)
    line = re.sub('\(.+?\)', '', line)
    line = re.sub('\<.+?\s', '', line)
    line = re.sub('\{.+?\)', '', line)

    # if "[" in line:
    #     end = line.index("[")
    # elif "(" in line:
    #     end = line.index("(")
    # elif "<" in line:
    #     end = line.index("<")
    # elif "@" in line:
    #     end = line.index("@")

    # remove " ", remove (DEQ)
    line = line[start:end]

    return line


def read_lines(file):
    f = open(file)
    lines = f.readlines()
    f.close()
    return lines

def get_value(line):
    pos = line.find(':') + 1
    return line[pos:]


class Email:
    def __init__(self, istart, iend):
        self.istart = istart
        self.iend = iend
        self.sender = ''
        self.receiver = ''
        self.cc = ''
        self.time = ''
        self.subject = ''
        self.pdfpageno = -1

    def set_body(self,lines):
        self.body = lines
    
    def set_sender(self):
        for line in self.body:
            if "From:" in line:
                self.sender = get_value(line)
            if "To:" in line:
                self.receiver = get_value(line)
            if "Sent:" in line:
                self.time = get_value(line)
            if "Cc:" in line:
                self.cc = get_value(line)
#                print line
#                print self.cc
            if "Subject:" in line:
                self.subject = get_value(line)

            if "PDF_PAGE_NO" in line:
                if ( self.pdfpageno < 0 ):
                    self.pdfpageno = int(get_value(line))

    def get_mongodb_doc(self):
        
        self.doc = { 'line_from' : self.istart, \
                     'line_to'   : self.iend, \
                     'subject'   : self.subject, \
                     'sender'    : self.sender, \
                     'receiver'  : self.receiver, \
                     'time'      : self.time, \
                     'cc'        : self.cc, \
                     'pdfpageno' : self.pdfpageno }

        return self.doc

    def display(self):

        print( "line  ", self.istart )
        print( " -------- " )
        print( "line  ", self.iend )
        print( "subject  : ", self.subject )
        print( "sender   : ", self.sender )
        print( "receiver : ", self.receiver )
        print( "time     : ", self.time )
        print( "cc       : ", self.cc )
        print( "pdfpageno: ", self.pdfpageno )
#        for line in self.body:
#            print line

    

class TextFile:
    def __init__(self, filename):

        self.n_froms = []
        self.emails = []

        self.lines = read_lines(filename)
        self.find_froms()
        self.split_emails()
    
#        print self.n_froms
        
    def find_froms(self):
        n = 0
        for line in self.lines:
            if "From:" in line:
                self.n_froms.append(n)
            n = n + 1    
        
        self.n_froms.append(len(self.lines))
    
    def split_emails(self):
        for i in range(len(self.n_froms)-1):
            istart = self.n_froms[i]
            iend = self.n_froms[i+1]

            m = Email(istart, iend)
            m.set_body(self.lines[istart:iend])
            m.set_sender()

            self.emails.append(m)

if __name__ == "__main__":
            
    txtfile = TextFile(sys.argv[1])

    emails = []
    n_froms = txtfile.n_froms
    emails = txtfile.emails

    n = 1
    for m in emails:
        print( "Email ------ ", n )
        m.display()
        n = n + 1