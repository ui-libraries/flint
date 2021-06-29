
# table of contents

# # # getTS -- input emailstext, output list of TS
# # # getUnixTS -- input emailstext, output list of UNIX TS
# # # fixTS -- input list of TS, outputs unix-friendly list of TS (built into getTS)

# # # # nodotzero -- takes .0 off of unix TS (built into getUnixTS)
# # # getUnixTS -- input emailstext, output list of UNIX TS
# # # getUnixTSr -- getUnixTS, but rounds to hundreds place (-2) and outputs list w/ duplicates (TS w/in 100 sec)
# # # # NoUnix -- pulls timestamps that are non-unixable

import re
import datetime
import dateutil.parser

def getTS(text):
    import datetime
    import dateutil.parser
    import re
    tsreg="\n\W*[Ss][ae]nt[:;](\n+[TSAD])|Date[:;](\n+[TSAD])|\n\W*[Ss][ae]nt[:;]\s*(.*)|Date[:;](.*)|On ([A-Z].*[AP][M]).*\n*.* wro[tf]e|On ([A-Z].*2[01][0-9][0-9]).*\n*.*wro[tf]e|On(.*\n*.*)wro.e"
    tsregraw="\n\W*[Ss][ae]nt[:;]\s*\n*.*|Date[:;]\n*.*|On [A-Z].*[AP][M].*\n*.* wro[tf]e|On [A-Z].*2[01][0-9][0-9].*\n*.*wro[tf]e|On.*\n*.*wro.e"
    ts0 = re.findall(tsreg,text)
    ts1=[]
    for line in ts0:
        for field in line:
            if re.findall("^\n+[TSAD]$",field)!=[]: #empty TS field; e.g., Sent:\nTo:
                ts1.append("NOTIMESTAMP")
            elif field!='':
                field=clean(field)
                field=preprocess(field)
                field=re.sub("^\s*|\s*$| :","",field)
                field = re.sub("AM.*","AM",field)
                field = re.sub("PM.*","PM",field)
                TS = fixTS(field)
                ts1.append(TS)

    return ts1

def getUnixTS(emailstext,r=""):
    import re
    import datetime
    import dateutil.parser
    
    listTS = getTS(emailstext)
    unixtimes = []
    errs = []
    for TS in listTS:
        if TS == "NOTIMESTAMP":
            unixtimes.append(TS)
        else:
            listuTS,errs0 = toUnixTime([TS])
            errs.extend(errs0)
            if listuTS==[]:
                errs.append(TS)
            elif len(listuTS)==1:
                unixtime=listuTS[0]
                if r=="r":
                    unixtime=round(int(unixtime),-2)
                    unixtimes.append(unixtime)
                else:
                    unixtimes.append(int(unixtime))
            else:
                print("ERR")
                print(TS)    
    return unixtimes,errs


def toUnixTime(time_list):
    import re
    import datetime
    import dateutil.parser
    new_list = []
    errs=[]
    for t in time_list:
        try:
            unixtime = dateutil.parser.parse(t).timestamp()
            if 946684800<unixtime<1546344000: # only 1/1/00-1/1/19
                new_list.append(unixtime)
            else:
                errs.append(t)
        except Exception:
            errs.append(t)
    return new_list, errs


def fixTS(TS): #fix timestamps
    import re
    
    def fixtime(TS,findre,bad,good):
        fin_list = []
        noti_list = []
        fdig = re.findall(findre,TS)
        if fdig == []:
            return TS
        else:
            n1 = re.sub(bad,good,fdig[0])
            return n1
    for i in range(0,3):
        TS= daymofix(TS) # see below
        TS= timefix(TS) # see below
        TS= fixtime(TS,".* 26[10][0-9] .*","26","20")
        TS= fixtime(TS,".* 70[10][0-9] .*","70","20")
        TS= fixtime(TS,".* 207[0-9] .*","207","201")
        TS= fixtime(TS,".* 202[0-9] .*","202","201")
        TS= fixtime(TS,".* [0-9]+:*\.:*[0-9]+ .*","\.",":")
        TS= fixtime(TS,".*20[10][0-9] [012]*[0-9] :[0-9][0-9][\s]*[AP]M"," :",":")
        TS= fixtime(TS,".*20[10][0-9] [012]*[0-9]: [0-9][0-9][\s]*[AP]M",": ",":")
        TS= fixtime(TS,".*20[10][0-9] [012]*[0-9]:[0-9][0-9]:[\s]*[AP]M",": ","")
        TS= fixtime(TS,".*20[10][0-9] [012]*[0-9]:[0-9][0-9]: [0-9[0-9][\s]*[AP]M",": ",":")
        TS= fixtime(TS,".*at [01]*[0-9] :[0-9][0-9][\s]*[AP]M"," :",":")
        TS= fixtime(TS,".*at [01]*[0-9]: [0-9][0-9][\s]*[AP]M",": ",":")
        TS= fixtime(TS,".*at [01]*[0-9]: [0-9][0-9].*[\s]*[AP]M",": ",":")
        TS= fixtime(TS,".*at [01]*[0-9]:[0-9][0-9]:[\s]*[AP]M",": ","")
        TS= fixtime(TS, ".*: .*",": ","")
        TS= fixtime(TS, ".*::.*","::",":")
        TS= fixtime(TS, ".* r .*","r","at")
        TS= fixtime(TS, ".* L Fri.*","L","")
        TS= fixtime(TS, ".*Tuesday, October 06, 201 11.*","201","2015")
        TS= fixtime(TS, ".*FM.*","FM","PM")
    

    return TS






def getUnixTSr(emailstext): #rounds, so that timestamps within 100 secs of each other are the same
    import re
    import datetime
    import dateutil.parser
    utnd = getUnixTS(emailstext)
    rtnd = []
    for uts in utnd:
        if uts == "NOTIMESTAMP":
            rtnd.append(uts)
        elif uts == 1440979200: #manual exclusion
            pass
        elif uts == -55800190600: #manual correction  deq14_b728_2054_2054_1.txt--3/3
            rtnd.append(1444129440)
        else:
            nuts = round(int(uts),-2)
            rtnd.append(nuts)
    return rtnd

def NoUnix(time_list):
    import datetime
    import dateutil.parser
    import re
    new_list = []
    error = []
    for t in time_list:
        try:
            unixtime = dateutil.parser.parse(t).timestamp()
            new_list.append(unixtime)
        except Exception:
            error.append(t)  
    return error




def preprocess(y):
        y =y.replace('\t',' ')
        #y =y.replace('\n',' ')
        y =y.replace('(',' ')
        y =y.replace(')',' ')
        y =y.replace('[',' ')
        y =y.replace(']',' ')
        y =y.replace('{',' ')
        y =y.replace('}',' ')
        y =y.replace(',',' ')
        y =y.replace('"','')
        y =y.replace("'",'')
        y =y.replace("_","")
        y =y.replace("- ","")
        y =y.replace("|","")
        y =y.replace("~","")
        y =y.replace(".","")
        y =y.replace("+ ","")
        y =y.replace("=","")
        y =y.replace("C ","")
        y =y.replace("o ","")
        y =y.replace(";",":")
        y =y.replace("; ","")
        y =y.replace("`","")
        y =y.replace("y:","y")
        y =y.replace("?","2")
        y =y.replace("‘","")
        y =y.replace("é","e")
        y =y.replace("ﬁ","at")
        y =y.replace(";","")
        y =y.replace("\.","")
        y =y.replace(" a[l1iI] "," at ")
        return(y)

def clean(text):
    text=re.sub("\(|\)",".",text)
    text=re.sub("\[|\]",".",text)
    text=re.sub("\{|\}",".",text)
    text=re.sub("\?",".",text)
    text=re.sub("\|","I",text)
    text=re.sub("\*|\+|\$|\^",".",text)
    text=re.sub("\\\\",".",text)
    return text


def nodotzero(listofunixts):
    import re
    newunix = []
    for unixts0 in listofunixts:
        ut = str(unixts0)
        h = re.sub("\.0","",ut)
        newunix.append(h)
    return newunix




def daymofix(TS):
    def repl(TS,regex,day):
        import re
        newlist = []
        M = re.findall(regex,TS)
        if M != "":
            x = re.sub(regex,day,TS)
            return x        
        else:
            return TS
        return newlist
    def dayall(TS):
        m = repl(TS,"M[A-Za-z][A-Za-z]+y |IVlbnday ","Monday ")
        t = repl(m,"Tu[A-Za-z:]+..y ","Tuesday ")
        w = repl(t,"W[A-Za-z]+[yY] ","Wednesday ")
        th = repl(w,"Th[A-Za-z]+[yv] ","Thursday ")
        f = repl(th,"[Ff]r[A-Za-z1]+[yY] ","Friday ")
        f2 = repl(f,"[Ff][!A-Za-z1]+a[yv] ","Friday ")
        f3 = repl(f2,"Fni |Fr[t1l]* |Fi1","Fri ")
        sa = repl(f3,"[Ss]a[A-Za-z]+y ","Saturday ")
        su = repl(sa,"[Ss]u[A-Za-z]+y ","Sunday ")
        th2 = repl(su," hursday ","Thursday ")
        return th2
    def moall(TS):
        m = repl(TS,"Jan[A-Za-z][A-Za-z]+ |lanuary ","Jan ")
        t = repl(m,"[Ft]eb[A-Za-z]+y ","Feb ")
        w = repl(t,"S[A-Za-z]+ber ","Sept ")
        th = repl(w,"Ap[A-Za-z]+ ","Apr ")
        oc = repl(th,"Oc[A-Za-z]+er ","Oct ")
        ju = repl(oc,"Junhe ","June ")
        de = repl(ju,"[N]*Dec.[A-Za-z]+er[n]* ","Dec ")
        return de
    TS= dayall(TS)
    TS= moall(TS)
    return TS

def timefix(TS):
    def timefix1(TS): #fix 12: 15 PM
            fdig = re.findall(".*20[120][0-9] [012]*[0-9]: [0-9][0-9][\s]*[AP]M",TS)
            if fdig == []:
                return TS
            else:
                n1 = re.sub(": ",":",fdig[0])
                return n1
    def timefix2(TS): #fix  Thursday November 05  2015 10:1839 AM
            x = re.findall(".*[012]*[0-9]:[0-9][0-9][0-9][0-9][\s]*[AP]M",TS)
            if x == []:
                return TS
            else:
                beg = re.findall("(.*)[012]*[0-9]:[0-9][0-9][0-9][0-9][\s]*[AP]M",x[0])
                hrmn = re.findall(".*([012]*[0-9]:[0-9][0-9])[0-9][0-9][\s]*[AP]M",x[0])
                sec = re.findall(".*[012]*[0-9]:[0-9][0-9]([0-9][0-9])[\s]*[AP]M",x[0])
                end = re.findall(".*[012]*[0-9]:[0-9][0-9][0-9][0-9]([\s]*[AP]M)",x[0])
                full = str(beg[0] + hrmn[0] + ":" + sec[0] + end[0])
                return full
    def timefix3(TS): #fix 3 05 --> 3:05
            x = re.findall(".*[0-9]*[0-9] [0-9][0-9][\s]*[AP]M",TS)
            if x == []:
                return TS
            else:
                beg = re.findall("(.*)[0-9]*[0-9] [0-9][0-9][\s]*[AP]M",x[0])
                #yr = re.findall("()[012]*[0-9] [0-9][0-9][\s]*[AP]M",x[0])
                ti = re.findall(".*([0-9]*[0-9] [0-9][0-9])[\s]*[AP]M",x[0])
                end = re.findall(".*[0-9]*[0-9] [0-9][0-9]([\s]*[AP]M)",x[0])
                gti = re.sub(" ",":",ti[0])
                full = str(beg[0] + gti + end[0])
                return full
    def timefix4(TS): # fix 540 AM --> 5:40 AM
            x = re.findall(".*[0-9]*[0-9][0-9][0-9][\s]*[AP]M",TS)
            if x == []:
                return TS
            else:
                beg = re.findall("(.*)[0-9]*[0-9][0-9][0-9][\s]*[AP]M",x[0])
                hr = re.findall(".*([0-9]*[0-9])[0-9][0-9][\s]*[AP]M",x[0])
                mn = re.findall(".*[0-9]*[0-9]([0-9][0-9])[\s]*[AP]M",x[0])
                end = re.findall(".*[0-9]*[0-9][0-9][0-9]([\s]*[AP]M)",x[0])
                full = str(beg[0] + hr[0] + ":" + mn[0] + end[0])
                return full
    def timefix5(TS): #fix 20156:04 PM --> 2015 6:04 PM
                x = re.findall(".*20[120][0-9][0-9:]+[\s]*[AP]M",TS)
                if x == []:
                    return TS
                else:
                    yr = re.findall("20[012][0-9]",x[0])
                    yr_sp = str((yr[0]) + " ")
                    good = re.sub("20[120][0-9]",yr_sp,x[0])
                    return good
    TS= timefix1(TS)
    TS= timefix2(TS)
    TS= timefix3(TS)
    TS= timefix4(TS)
    TS= timefix5(TS)
    return TS