from modules import emails
import re
def parseEmails(db,sfun):
    import time
    start_time = time.time()
    dbex=[]
    nott=[]
    for item in db:
        try:
            pgid=item[0]
            pg=re.sub("--[0-9]+/[0-9]+","",pgid)
            emailnum=re.findall("txt--([0-9]+)/[0-9]+",pgid)
            totnum=re.findall("txt--[0-9]+/([0-9]+)",pgid)
            etext = emails.getEmail(pg) # get text of email
            etext=clean(etext) # get rid of interfering characters (e.g. parentheses)

            sreg=sfun.getSNDRre('','s_starts.txt')
            estarts0 = re.findall(sreg,etext)
            estarts=[]
            for thing in estarts0:
                if thing !='':
                    estarts.append(thing)
            m_etext=mark(etext,estarts)

            if estarts==[]:
                    print("no email start found")
                    #pass
            elif estarts!=[]:
                if emailnum=='1' and totnum=='1': #only email on pg
                    em=m_etext
                    new=(item,em)
                    dbex.append(new)
                elif emailnum<=totnum: # not last email on pg
                    estart=re.findall(str("˚"+emailnum[0]+"˚"),m_etext)
                    if emailnum==totnum:
                        re1=str(estart[0])+"[^˚]+$"
                    elif emailnum<totnum:
                        enext=re.findall(str("˚"+str(int(emailnum[0])+1)+"˚"),m_etext)     
                        re1="("+str(estart[0])+"[^˚]+)"+str(enext[0])
                    em=re.findall(re1,m_etext)
                    #new=(item[0],estart,enext,em,re1)
                    new=(item,em)
                    dbex.append(new)
            print(len(dbex),end="\r")
            if m_etext==[]:
                print(item)
        except:
            #print(item)
            nott.append(item)
            pass
    print("time: " + "%s seconds" % (time.time() - start_time))
    return dbex, nott










def subeadd(text):
    text=re.sub("[\s]*[A-Za-z]*@[A-Za-z.]*","",text)
    text=re.sub("mailto","",text)
    return text
def replpar(text):
    text=re.sub("\(|\)",".",text)
    text=re.sub("\[|\]",".",text)
    text=re.sub("\{|\}",".",text)
    text=re.sub("\|",".",text)
    return text
def clean(text):
    text=re.sub("\(|\)",".",text)
    text=re.sub("\[|\]",".",text)
    text=re.sub("\{|\}",".",text)
    text=re.sub("\?",".",text)
    text=re.sub("\|","I",text)
    text=re.sub("\*|\+|\$|\^",".",text)
    text=re.sub("\\\\",".",text)
    return text
def mark(etext,starts):
    for s,i in zip(starts,range(0,len(starts))):
        ms="˚"+str(i+1)+"˚"+str(s)
        etext=re.sub(str("[^˚]"+s),str("\n"+ms),etext)
        #etext=re.sub(s,ms,etext)
    return etext

def testgHM(pg,fun,deptfile):
    err=[]
    listTSr = uts.getUnixTSr(pg) #1*
    if listTSr==[]:
        err.append('no TS')
    listSo1,listSo = fun.findSenders(pg,cleanlist,0) #2*
    if listSo==[]:
        err.append('no Sndr')
    listto1,listto = fun.findTo(pg,cleanlist, 0)
    if listto==[]:
        err.append('no To')
    listCc1,listCc = fun.findCc(pg,cleanlist,0)#3
    if listCc==[]:
        err.append('no Cc')
    listSub = fun.findSubjects(pg) #4*
    if listSub==[]:
        err.append('no sub')
    if len(listTSr)>1 or len(listSo)>1:
        err.append('excess email')
    new=(deptfile,err)
    return new

def getpgid(pg1,cleanlist,sfun,deptlist):
    hm=sfun.getHM([pg1],cleanlist,sfun,deptlist)
    if hm!=[]:
        totnum=len(hm[0][1])+1
    else:
        totnum=1
    regex = sfun.getreg(deptlist)
    pgname = re.findall(regex,pg1)
    pgid=str(pgname[0])+"--0/"+str(totnum)
    return pgid



