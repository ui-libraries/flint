import re


def getSplitHMs(listpgs,utsfun,hmfun,cleanlist,deptlist):
    listpgtext=getpg_text(listpgs,deptlist)
    splitpairs=getSplitPairs(listpgs,deptlist)
    newhm,nh,pg_nh,errs=fuseSplitHeads(splitpairs,listpgtext,utsfun,hmfun,cleanlist,deptlist)
    st_op5=[]
    for s in newhm:
        try:
            new=(s[0],(s[1],s[2],s[3],s[4],s[5][0]))
            st_op5.append(new)
        except:
            errs.append(s)
            pass
    print(str(len(st_op5))+" split emails recombined; " + str(len(errs)) + " unable to recombine")
    return st_op5,errs

def getSplitPairs(listpgs,deptlist):
    # get pairs of pages that contain two halves of one header
    badre="^[\n\W0-9 ]*Sent[:;]|^[\n\W0-9 ]*Date[:;]|^[\n\W0-9 ]*T[oa][:;]|^[\n\W0-9 ]*C[ec]+[:;]|^[\n0-9\W ]*Subject[:;]"
    bs=[]
    splitpairs=[]
    for text in listpgs:
        badstart=re.findall(badre,text) # find pgs that start mid-header ^
        if badstart!=[]:
            bs.append(text)
            regpg=getreg(deptlist)
            pg1name=re.findall(regpg,text)
            pg1=re.findall("_[0-9]+_[0-9]+_([0-9]+).txt",pg1name[0])
            pg0=(int(pg1[0])-1)
            pg0name=re.sub(str(pg1[0]+".txt"),str(pg0)+".txt",pg1name[0])
            pair=(pg0name,pg1name[0],badstart[0]) #(prev pg, pg w/ mid-head start, mid-head start)
            splitpairs.append(pair)
    splitpairs.sort()
    return splitpairs
def fuseSplitHeads(splitpairs,listpgtext,utsfun,hmfun,cleanlist,deptlist):
    # mid-head start pg = mh0, mid-head end pg = mh1
    # header metadata = hm
    errs=[]
    sreg=hmfun.getSNDRre("F",'s_starts.txt') #get regex for only Froms, not Ons
    nh=[]
    pg_nh=[]
    head0=[]
    head1=[]
    for pair in splitpairs:
        try:
            start=pair[2]
            start=clean(start)
            for pt in listpgtext:
                if pair[0]==pt[0]: # retrieve the text of mh0
                    text0=pt[1]
                    text0=clean(text0)
                    frxm=re.findall(sreg,text0) #get froms
                    head0start=frxm[-1] #take the last from
                    head0=re.findall("("+head0start+"[^˚]+)"+str(pt[0]),text0) #part1 of hm
                    #print(head0[0])
                    pass
                elif pair[1]==pt[0]: # retreive the text of mh1
                    text1=pt[1]
                    text1=clean(text1)
                    fullstart=start+".*\n+.*\n+.*\n+.*\n*.*" # swoop the net low to get full header
                    head1=re.findall(fullstart,text1) #part 2 of hm
                    #print(head1[0])
                    pass
                else:
                    pass
        except:
            errs.append(pair)
        if head0==[] or head1==[]:
            print(pair)
            #print(head0)
            #print(head1)

        else:
            newhead=head0[0]+head1[0] #fuse them together to make full header
            #newhead=re.sub("\n","",newhead)
            pgid=getpgid(text1,cleanlist,utsfun,hmfun,deptlist) # cr8s novel pgid: mh1--0/n
            new=str(newhead+'\n\n'+pgid)
            #print(new)
            nh.append(newhead)
            pg_nh.append(new)
            print(len(pg_nh),end='\r')
        #except:
         #   print(text0)
          #  break
    newhm,errs=getHM0(pg_nh,cleanlist,utsfun,hmfun,deptlist)
    return newhm,nh, pg_nh,errs


def getHM0(listpgs,cleanlist,utsfun,hmfun,deptlist): 
        Sdepts = []
        errs=[]
        #regex = dtbs.getreg(deptlist)
        regex="\n([a-z]+[_b0-9]+.txt[\W0-9]*)"
        allx=[]
        for pg in listpgs:
            listTS, TSerrs = utsfun.getUnixTS(pg,"r") #1*
            listSo1,listSo = hmfun.findSenders(pg,cleanlist,0) #2*
            listto1,listto = hmfun.findTo(pg,cleanlist, 0)
            listCc1,listCc = hmfun.findCc(pg,cleanlist,0)#3
            listSub = hmfun.findSubjects(pg) #4*
            if listSub==[]:
                listSub.append('NOSub')
            #regex = str('.*txt') # e.g. "dept.*txt"
            deptfile = re.findall(regex,pg) #0
            if deptfile == []:
                errs.append(deptfile)
            elif listTS == [] or listSo == []:
                errs.append(deptfile)
                pass
            else:
                try:
                    if len(listTS)>1 or len(listSo)>1:
                        err=('excess email')
                        new=(deptfile,err)
                        #errs.append(new)
                        #print(new)
                    Sdept = (deptfile[0],tuple(listTS)[0],tuple(listSo)[0],tuple(listto)[0],tuple(listCc)[0],tuple(listSub))
                    Sdepts.append(Sdept)
                    allx.append(deptfile)
                    sdl = (str(len(allx)))+"/"+(str(len(listpgs)))
                    pdl = "   " + str(round(len(allx)/len(listpgs)*100,2)) + '%'                           
                    print(sdl+pdl,end="\r")
                except:
                    err=testgHM(pg,utsfun,hmfun,deptfile,cleanlist)
                    errs.append(err)
                    #break
        return Sdepts,errs





def mark(etext,starts):
    for s,i in zip(starts,range(0,len(starts))):
        ms="˚"+str(i+1)+"˚"+str(s)
        etext=re.sub(str("[^˚]"+s),str("\n"+ms),etext)
        #etext=re.sub(s,ms,etext)
    return etext

def testgHM(pg,utsfun,hmfun,deptfile,cleanlist):
    err=[]
    listTS = utsfun.getUnixTS(pg,"r") #1*
    if listTS==[]:
        err.append('no TS')
    listSo1,listSo = hmfun.findSenders(pg,cleanlist,0) #2*
    if listSo==[]:
        err.append('no Sndr')
    listto1,listto = hmfun.findTo(pg,cleanlist, 0)
    if listto==[]:
        err.append('no To')
    listCc1,listCc = hmfun.findCc(pg,cleanlist,0)#3
    if listCc==[]:
        err.append('no Cc')
    listSub = hmfun.findSubjects(pg) #4*
    if listSub==[]:
        err.append('no sub')
    if len(listTS)>1 or len(listSo)>1:
        err.append('excess email')
    new=(deptfile,err)
    return new

def getpgid(pg1,cleanlist,utsfun,hmfun,deptlist):
    hm=hmfun.getHM([pg1],cleanlist,utsfun,hmfun,deptlist)
    if hm!=[]:
        totnum=len(hm[0][1])+1
    else:
        totnum=1
    regex = hmfun.getreg(deptlist)
    pgname = re.findall(regex,pg1)
    pgid=str(pgname[0])+"--0/"+str(totnum)
    return pgid

def clean(text):
    text=re.sub("\(|\)",".",text)
    text=re.sub("\[|\]",".",text)
    text=re.sub("\{|\}",".",text)
    text=re.sub("\?",".",text)
    text=re.sub("\|","I",text)
    text=re.sub("\*|\+|\$|\^",".",text)
    text=re.sub("\\\\",".",text)
    return text


def getreg(listofdepts):
    refs=[]
    for dept in listofdepts:
        bn1 = "[0-9]*_b[0-9]+_[0-9]+_[0-9]+_.*txt"
        ref = str(dept + bn1 + "|")
        refs.extend(ref)
    refs.pop()
    refss = ''.join(refs)
    return refss



def getpg_text(listpgs,deptlist):
    listpgtext=[]
    for text in listpgs:
        try:
            regpg=getreg(deptlist)
            pgname=re.findall(regpg,text)
            new=(pgname[0],text)
            listpgtext.append(new)
        except:
            if text=="---BOOKMARKend---":
                pass
            else:
                print(text)
    return listpgtext