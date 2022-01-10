import sys
sys.path.insert(0, '//notebooks/Hannah notebooks/header metadata/modules')

import re
import os
import json
from itertools import repeat
import statistics
import random
from itertools import repeat

    
def getFP5(listpgs,utsfun,hmfun,deptlist):
    import time
    start_time = time.time()
    cleanlist = gettxtlist('txtfiles/cleanlist.txt') #'clean' list of names
    FP5 = getHM(listpgs,cleanlist,utsfun,hmfun,deptlist)

    print("time: " + "%s seconds" % (time.time() - start_time))
    return FP5


def getDB(listpgs,utsfun,hmfun,esfun,deptlist):
    
    cleanlist = gettxtlist('txtfiles/cleanlist.txt')
    print("                  pg HM",end='\r')
    FP5 = getHM(listpgs,cleanlist,utsfun,hmfun,deptlist)
    FP50, dalluts = mismatches(FP5)
    print("            processing",end="\r")

    n_OP5 = process(FP50,'5',"id")
    s_OP5,errs=esfun.getSplitHMs(listpgs,utsfun,hmfun,cleanlist,deptlist)
    OP5=n_OP5+s_OP5
    
    print("*** "+str(len(OP5)) + " total emails returned, none X excl")
    return FP5, FP50, OP5, dalluts

def getHMdups(x,OP5,dalluts):
    OPx =xfrom5(OP5,x)
    print("            combining    ",end="\r")
    OPxe = exclude(OPx,dalluts,x)
    OTx = combine(OPx)
    OTxe = combine(OPxe)
    OTx.sort(key=takeFofF)
    print(str(len(OPxe)) + " total emails returned, exclusions made")
    print("*** "+str(len(OTx)) + " unique emails returned, no excl made")
    print(str(len(OTxe)) + " unique emails returned, exclusions made")
    return OPxe, OTx, OTxe



def getDBAB(fpds, op5, ot2,ot5,typeA,typeB):
    import time
    start_time = time.time()
    newdb=[]
    for xs in op5:
        iAcode=''
        iBcode=''
        e=xs[1]
        pgidx=xs[0]
        repg = getreg(["msp","deq","dhhs","executiveofficeemails"])
        #repg = str(dept + ".*txt")
        pg0 = re.findall(repg,pgidx)
        pgx = pg0[0]
        for B in typeB:
            pgidB = B[0]
            Bcode = B[1]
            if pgidx==pgidB:
                iBcode = Bcode
        for A in typeA:
            pgA = A[0]
            Acode = A[1]
            if pgx==pgA:
                iAcode = Acode
        new = (pgidx,e,iAcode,iBcode)
        newdb.append(new)
        sdl = (str(len(newdb)))                           
        print(sdl,end="\r")
        
    pgds1=[]
    pgds2=[]
    newdba=[]
    # connects to other header metadata
    for d in newdb:
        pgd = d[0]
        pgds1.append(pgd)
        usd = d[1]
        A = d[2]
        B = d[3]
        for a in op5:
            pga = a[0]
            usa = a[1]
            if pgd == pga:
                new = (pgd,usa,A,B)
                pgds2.append(pgd)
                newdba.append(new)
                sdl = (str(len(newdba)))                          
                print(sdl,end="\r")
    #CHECK
    if len(pgds1)==len(pgds2):
        pass
    else:
        print("ERROR: " + str(len(pgds1)-len(pgds2)) + " lost")
    ph=[]
    phu=[]
    for item in newdba:
        e = item[1]
        ut = e[0]
        sndr = e[1]
        to = e[2]
        cc = e[3]
        sub = e[4]
        if ut == "NOTIMESTAMP" and sndr == "X":
            ph.append(item)
    percph = str((round((len(ph)/len(newdba)*100),3)))
    print(str(len(ph)) + "(" + percph + "%) are placeholders")
    print("\n\n")
    print("total time: " + "%s seconds" % (time.time() - start_time))
    return newdb,newdba








# secondary functions

def xfrom5(op5,x):
    newlist2 = []
    for item in op5:
        deptf = item[0]
        news=item[1]
        if x=="5":
            r = (deptf,(news[0],news[1],news[2],news[3],news[4]))
            newlist2.append(r)
        elif x=="4":
            r = (deptf,(news[0],news[1],news[2],news[3]))
            newlist2.append(r)
        elif x=="3":
            r = (deptf,(news[0],news[1],news[2]))
            newlist2.append(r)
        elif x=="2":
            r = (deptf,(news[0],news[1]))
            newlist2.append(r)
        elif x=='s':
            r = (deptf,(news[0],news[1],news[4]))
            newlist2.append(r)
        elif x=='cc':
            r = (deptf,(news[0],news[1],news[3]))
            newlist2.append(r)
        else:
            print("invalid")
    if x == '5': # if subj is included
        op5Post = subPost(newlist2) # fixing for pgs that start w/ subj
        return op5Post
    elif x != '5':
        return newlist2
        #print(len(newlist2),end="\r")


def gettxtlist(pathtotxt):
        import os
        import re
        import sys
        fileDir = os.path.dirname(os.path.realpath('__file__'))
        filename = os.path.join(fileDir, pathtotxt)
        f = open(filename, "r+")
        txtlist0 = f.read()
        txtlist = re.split('\n',txtlist0)
        return txtlist

def getHM(listpgs,cleanlist,utsfun,hmfun,deptlist): 
        Sdepts = []
        regex = getreg(deptlist)
        allx=[]
        for pg in listpgs:
            listTS, TSerrs = utsfun.getUnixTS(pg,"r") #1*
            listSo1,listSo = hmfun.findSenders(pg,cleanlist,0) #2*
            listto1,listto = hmfun.findTo(pg,cleanlist, 0)
            listCc1,listCc = hmfun.findCc(pg,cleanlist,0)#3
            listSub = hmfun.findSubjects(pg) #4*
            #regex = str('.*txt') # e.g. "dept.*txt"
            deptfile = re.findall(regex,pg) #0
            if deptfile == []:
                allx.append(deptfile)
            elif listTS == [] or listSo == []:
                allx.append(deptfile)
            else:
                Sdept = (deptfile[0],tuple(listTS),tuple(listSo),tuple(listto),tuple(listCc),tuple(listSub))
                Sdepts.append(Sdept)
                allx.append(deptfile)
                sdl = (str(len(allx)))+"/"+(str(len(listpgs)))
                pdl = "   " + str(round(len(allx)/len(listpgs)*100,2)) + '%'                           
                print(sdl+pdl,end="\r")
                #print(pdl,end="\r")
        return Sdepts

def mismatches(deptpg):
    deptslist = []
    misfits=[]
    for depts in deptpg:
        if len(depts[1]) == len(depts[2]) == len(depts[3]) == len(depts[4]) == len(depts[5]):
            deptslist.append(depts)
        else:
            misfits.append(depts)
    if len(deptpg)!=0:
        print("% with all matched fields: " + str(len(deptslist)/len(deptpg)*100)) # % good
    # what is in that other 11%?
    alluts=[]
    otheruts=[]
    missing=[]
    missingts=[]
    misuts=[]
    for series in deptslist:
        utslist = series[1]
        for ut in utslist:
            alluts.append(ut)
    dalluts=list(dict.fromkeys(alluts)) #all uts in good

    for series in misfits:
        utslist = series[1]
        for ut in utslist:
            misuts.append(ut)

    for ut in misuts:
        if ut not in dalluts:
            missing.append(ut)

    fixed = []
    for m in misfits: #missing or misfits, dep if you want to include already-accted-for dups in misfits
        lenuts = len(m[1])
        lensen = len(m[2])
        lento = len(m[3])
        lencc = len(m[4])
        lensub = len(m[5])
        if lensen != lenuts:
            sen = []
            for i in repeat(None, lenuts):
                sen.append("X")
        else:
            sen = m[2]
        if lento != lenuts:
            tos = []
            for i in repeat(None, lenuts):
                tos.append("X")
        else:
            tos = m[3]
        if lencc != lenuts:
            ccs = []
            for i in repeat(None, lenuts):
                ccs.append("X")
        else:
            ccs = m[4]
        if lensub != lenuts:
            subs = []
            for i in repeat(None, lenuts):
                subs.append("X")
        else:
            subs = m[5]
        new = (m[0],m[1],sen,tos,ccs,subs)
        fixed.append(new)
    deptpg2 = list(deptslist + fixed)
    #CHECK
    deptslist2 = []
    misfits2=[]
    for depts in deptpg2:
        if len(depts[1]) == len(depts[2]) == len(depts[3]) == len(depts[4]) == len(depts[5]):
            deptslist2.append(depts)
        else:
            misfits2.append(depts)
    if len(deptpg2)!=0:
        print("after clearing bad fields of mismatched pages, " + str((len(deptslist2)/len(deptpg2))*100) + "% of pages have all matched fields") # % good
    return deptpg2, dalluts
    
    
    

# KEY: a - all; b - nosub; c - nosub, noCCs; d - nosub, noCCs, noTos
def process(deptslist,k,ID):
    newlist1 = []
    for md in deptslist:
        tss = md[1]
        sndrs = md[2]
        tos = md[3]
        Ccs = md[4]
        subs = md[5]
        o = len(tss)
        p = len(sndrs)
        if ID == "id":
            for x in range(o):
                fileid = str(str(md[0]) + "--" + str(x+1) + "/" + str(o))
                g = (fileid,(tss[x]),(sndrs[x]),tuple(tos[x]),tuple(Ccs[x]),(subs[x]))
                newlist1.append(g)
        elif ID == "noid":
            for x in range(o):
                g = (md[0],(tss[x]),(sndrs[x]),tuple(tos[x]),tuple(Ccs[x]),(subs[x]))
                newlist1.append(g)

    newlist2 = []
    for news in newlist1:
        deptf = news[0]
        if k=="5":
            r = (deptf,(news[1],news[2],news[3],news[4],news[5]))
            newlist2.append(r)
        elif k=="4":
            r = (deptf,(news[1],news[2],news[3],news[4]))#,news[5]))
            newlist2.append(r)
        elif k=="3":
            r = (deptf,(news[1],news[2],news[3]))#,news[4],news[5]))
            newlist2.append(r)
        elif k=="2":
            r = (deptf,(news[1],news[2]))#,news[3],news[4],news[5]))
            newlist2.append(r)
        elif k=='s':
            r = (deptf,(news[1],news[2],news[5]))
            newlist2.append(r)
        elif k=='cc':
            r = (deptf,(news[1],news[2],news[4]))
            newlist2.append(r)
        else:
            print("invalid")
    if k == '5': # if subj is included
        op5Post = subPost(newlist2) # fixing for pgs that start w/ subj
        return op5Post
    elif k != '5':
        return newlist2
        #print(len(newlist2),end="\r")


def subPost(op5): #if to and cc=on, but subj!=on; or if sub=on and cc and to !=on
    ph1=[]
    ph2=[]
    op5post=[]
    for item in op5:
        e = item[1]
        ut = e[0]
        sndr = e[1]
        to = e[2]
        cc = e[3]
        sub = e[4]

        if "NOCc (On)" in cc and "NOTo (On)" in to and sub!="NOSub (On)":
            ph1.append(item) #replace sub with "NOSub (On)" in post
            newsub="NOSub (On)"
            new=(item[0],(ut,sndr,to,cc,newsub))
            op5post.append(new)
            pass
        elif sub=="NOSub (On)" and "NOCc (On)" not in cc and "NOTo (On)" not in to:
            ph2.append(item) #replace sub with "X"
            newsub="X"
            new=(item[0],(ut,sndr,to,cc,newsub))
            op5post.append(new)
            pass
        else:
            op5post.append(item)
        

    percph1 = str((round((len(ph1)/len(op5)*100),3)))
    percph2 = str((round((len(ph2)/len(op5)*100),3)))
    print(str(len(ph1)) + "(" + percph1 + "%) mismatched, inserted NOSub (On)")
    print(str(len(ph2)) + "(" + percph2 + "%) mismatched, replaced To and Cc with X")
    if len(op5)==len(op5post):
        return op5post
    else:
        print("ERROR---subPost")
        return op5

def exclude(newlist,dalluts,k):
    dn = []
    newlist2 = []
    for series in newlist:
            e = series[1]
            if k == "5":
                if e[1] == 'X' or e[2] == ('X',) or e[3] == ('X',) or e[4] == 'X':
                    if e[0] in dalluts:
                        dn.append(series)
                    else:
                        newlist2.append(series)
                else:
                    newlist2.append(series)
            elif k == "2":
                if e[1] == 'X':
                    if e[0] in dalluts:
                        dn.append(series)
                    else:
                        newlist2.append(series)
                else:
                    newlist2.append(series)
    if len(newlist)!=0:
        print(str(len(dn)) + " emails w/ cleared fields (" + str((len(dn)/len(newlist))*100) + "%) excl'd in e versions") #because they probly have duplicates
    return newlist2




def combine(list0):
    ndl = {}
    nts = []
    for tups in list0:
        deptf = tups[0]
        metadata = tups[1]
        ut = metadata[0]
        if ut != "NOTIMESTAMP":
            deptflist = [deptf]
            newdic = {}
            if metadata not in [*ndl]:
                newdic[(metadata)] = deptflist
                ndl.update(newdic)
                print(len(ndl),end="\r")
            else:
                ndl[(metadata)].append(deptf)
                pass
                print(len(ndl),end="\r")
        elif ut == "NOTIMESTAMP":
            tups1 = ((metadata),[deptf])
            nts.append(tups1)
            #print(len(nts),end="\r")
    lndl = tolist(ndl)
    lndl.extend(nts)
    return lndl

def db2txt(fulldb5,filename):
    news=[]
    for xs in fulldb5:
        em = xs[1]
        files = xs[0]
        #files1=', '.join(files)
        uts=em[0]
        frum=em[1]
        to=em[2]
        to1 = ';;'.join(to)
        cc=em[3]
        cc1 = ';;'.join(cc)
        sub=em[4]
        a = xs[2]
        b = xs[3]
        new = ("UTS:" + str(uts) + "//SNDR:" + frum + "//TO:" + to1 + "//CC:" + cc1 + "//SUB:" + sub + "//A:" + a + "//B:" + b + '////file:' + files + '\nSPLIT\n')
        news.append(new)
    news1='\n'.join(news)
    f = open(filename,'w')
    f.write(news1) #delete the final comma from final text file
    f.close()
    return news1

def txt2db(txtfile):
    f = open(txtfile)
    db = f.read()
    dblist0 = re.split('\nSPLIT\n',db)
    dblist=[]
    bad=[]
    for item in dblist0:
        try:
            ut = re.findall("UTS:(.*)//SNDR",item)
            snr = re.findall("//SNDR:\n*(.*)//TO",item)
            tos = re.findall("//TO:\n*(.*)//CC",item)
            to=re.split(";;",tos[0])
            ccs = re.findall("//CC:\n*(.*)//SUB",item)
            cc=re.split(";;",ccs[0])
            sub = re.findall("//SUB:\n*(.*)//A",item)
            a = re.findall("//A:(.*)//B",item)
            b = re.findall("//B:(.*)////fi",item)
            file = re.findall("////file:(.*)",item)
            new = (file[0],(ut[0],snr[0],tuple(to),tuple(cc),sub[0]),int(a[0]),int(b[0]))
        except:
            bad.append(item)
            pass
        dblist.append(new)
    return dblist

def db2txtE(fulldb5,filename):
    news=[]
    for xs in fulldb5:
        em = xs[0][1]
        files = xs[0][0]
        #files1=', '.join(files)
        uts=em[0]
        frum=em[1]
        to=em[2]
        to1 = ';;'.join(to)
        cc=em[3]
        cc1 = ';;'.join(cc)
        sub=em[4]
        a = xs[0][2]
        b = xs[0][3]
        if xs[1]!=[]:
            etext = xs[1][0]
        elif xs[1]==[]:
            etext = "˚˚˚NO EMAIL TEXT FOUND˚˚˚"
        new = ("UTS:" + str(uts) + "//SNDR:" + frum + "//TO:" + to1 + "//CC:" + cc1 + "//SUB:" + sub + "//A:" + a + "//B:" + b + '////file:' + files + '\n˚EMAILTEXT:\n' + etext + '\n˚SPLIT\n\n')
        news.append(new)
    news1='\n'.join(news)
    f = open(filename,'w')
    f.write(news1)
    f.close()
    return news1

def txt2dbE(txtfile):
    f = open(txtfile)
    db = f.read()
    dblist0 = re.split('\n˚SPLIT\n',db)
    dblist=[]
    bad=[]
    for item in dblist0:
        try:
            ut = re.findall("UTS:(.*)//SNDR",item)
            snr = re.findall("//SNDR:\n*(.*)//TO",item)
            tos = re.findall("//TO:\n*(.*)//CC",item)
            to=re.split(";;",tos[0])
            ccs = re.findall("//CC:\n*(.*)//SUB",item)
            cc=re.split(";;",ccs[0])
            sub = re.findall("//SUB:\n*(.*)//A",item)
            a = re.findall("//A:(.*)//B",item)
            b = re.findall("//B:(.*)////fi",item)
            file = re.findall("////file:(.*)",item)
            etext = re.findall("\n˚EMAILTEXT:\n([^˚]*)\n˚SPLIT",item)
            new = (file[0],(ut[0],snr[0],tuple(to),tuple(cc),sub[0]),int(a[0]),int(b[0]),etext[0])
            dblist.append(new)
        except:
            bad.append(item)
            print(item)
            break
    return dblist



import re
def revlist(deqlist):
    newlist = list(reversed(deqlist))
    return newlist
def takeFirst(elem):
    return elem[0]
def takeSec(elem):
    return elem[1]
def takeThird(elem):
    return elem[2]
def takeFirstABC(elem):
    if type(elem[0]) == int:
        return int(elem[0])
    else:
        return int(0)
def takeSecondABC(elem):
    if type(elem[1]) == int:
        return int(elem[1])
    else:
        return int(0)
def takeNum(elem,x):
    return elem[x]
def takeSec(elem):
    return elem[1]
def takeNumifint(elem,x):
    if type(elem[x]) == int:
        return int(elem[x])
    else:
        return int(0)
def takeFofF(elem):
    for elems in elem:
        if type(elems[0]) == int:
            return elems[0]
        else:
            return int(0)
    return int(g[0])


def takeFirst1(elem):
    if type(elem[0]) == int:
        return int(elem[0])
    else:
        return int(0)
def tolist(r):
        listr = []
        for key, value in r.items():
            k = (key,value)
            listr.append(k)
        return listr
def getreg(listofdepts):
    refs=[]
    for dept in listofdepts:
        bn1 = "[0-9]*_b[0-9]+_[0-9]+_[0-9]+_.*txt"
        ref = str(dept + bn1 + "|")
        refs.extend(ref)
    refs.pop()
    refss = ''.join(refs)
    return refss
    
    
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
