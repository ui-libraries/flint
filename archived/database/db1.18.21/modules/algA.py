import sys
sys.path.insert(0, '//notebooks/Hannah notebooks/header metadata/modules')
from modules import emails
import re
import os
import json
from itertools import repeat
import statistics
import random
import csv

fileDir = os.path.dirname(os.path.realpath('__file__'))
filename = os.path.join(fileDir, 'txtfiles/cleanlist.txt')
f = open(filename, "r+")
cleanlist0 = f.read()
cleanlist = re.split('\n',cleanlist0)

fileDir = os.path.dirname(os.path.realpath('__file__'))
filename = os.path.join(fileDir, 'txtfiles/typolist.txt')
f = open(filename, "r+")
typolist0 = f.read()
typolist00 = re.split('\n',typolist0)
typolist=[]
for t in typolist00:
    if len(t)>3:
        typolist.append(t)


def getAcanons(fp2x,emailstext,deptlist,sfun):    
    esplit,esplit2=splitemails(emailstext)
    yfp5,Adups,tsAdups,Anodups,tsAnodups,Ad_depts,weedout=getDupSets(fp2x)
    scores1,scores3,scores4=algor_score(Ad_depts,yfp5,esplit,deptlist,typolist,cleanlist,sfun)
    goodpg=[]
    badpg=[]
    phpg=[]
    # get lists of canon, noncanon, and ph pages #
    for setd in scores4: #scores4=list of dup sets, where e/ set has canon dup marked as such
        for fn_sc in setd:
            pg = fn_sc[0]
            code = fn_sc[1]
            if code == 1:
                goodpg.append(pg)
            elif code == 0:
                badpg.append(pg)
    for w in weedout:
        ts = w[0]
        fn = w[1]
        phpg.append(fn)
    print("total dups: " + str(len(goodpg)+len(badpg)))
    
    # code the diff types of emails #
    # # # 0 = is a dup/DON'T USE; 1 = is a dup/USE; 2 = not a dup/USE
    db = []
    err = []
    print("labeling pages")
    for item in yfp5:
        e=item[1]
        t_s = (e[0],e[1])
        pg = item[0]
        if t_s in tsAdups: # if item has a duplicate
            if pg in goodpg: # and is good
                A = 1
                new = (item,A)
                db.append(new)
            elif pg in badpg: # and is trash
                A = 0
                new = (item,A)
                db.append(new)
            else:
                err.append(item)
        elif t_s in tsAnodups: # if item is not a duplicate
            A = 2
            new = (item,A)
            db.append(new)
        elif pg in phpg:
            A = 3
            new = (item,A)
            db.append(new)
        else:
            err.append(item)
            #print("ERROR")
            #print(item)
            #break

    # STEP 4.5: check ya work
    use = []
    dntuse = []
    useD = []
    useND = []
    useNO=[]
    usePH=[]
    for a in db:
        if a[1] == 1: #yesdups
            use.append(a)
            useD.append(a)
        elif a[1] == 2: #nodups
            use.append(a)
            useND.append(a)
        elif a[1] == 3: #placeholda
            use.append(a)
            usePH.append(a)
        elif a[1] == 0: #yesdups
            dntuse.append(a)
        else:
            print("ERROR, invalid code")
    print("canonical dups: "+str(len(useD)))
    print("canonical nondups: "+str(len(useND)))
    print("noncanonical dups: "+str(len(dntuse)))
    if len(Adups) - len(useD) == 0:
        pass
    else:
        print("ERROR1")
        print(len(tsAdups) - len(useD))
    if len(Anodups) - len(useND) == 0:
        pass
    else:
        print("ERROR2")
        print(len(tsAnodups) - len(useND))
    if len(use)+len(dntuse) == len(yfp5):
        pass
    else:
        print("ERROR3")
    
    listA=[]
    printA=[]
    for item in db:
        code = item[1]
        e = item[0]
        pgid = e[0]
        new = (pgid,code)
        newx = (pgid,str(code))
        listA.append(newx)
    #return db
    return scores1,scores3,scores4, listA





# secondary functions

def getDupSets(fp2x):
    yfp5=[]
    errors=[]
    for x in fp2x:
        fn = x[0]
        ut=x[1]
        sndrlist=x[2]
        tolist=x[3]
        cclist=x[4]
        subjlist=x[5]
        stup=[]
        for item in sndrlist:
            stup.append(item)
        totup=[]
        for item in tolist:
            totup.append(item)
        cctup=[]
        for item in cclist:
            cctup.append(item)
        try:
            new= (fn,(ut,tuple(stup),tuple(totup),tuple(cctup),tuple(subjlist)))
        except:
            errors.append(x)
            print(errors)
            break
        yfp5.append(new)

    rx,weedout = resort(yfp5) # unique pgs

    # STEP 2.1: take chunk of byts that have B duplicates
    Adups = []
    Anodups = []
    tsAdups=[]
    tsAnodups=[]
    for xs in rx:
        e=xs[0]
        ts=(e[0],e[1])
        if len(xs[1]) > 1:
            Adups.append(xs) #is a A dup
            tsAdups.append(ts)
        elif len(xs[1]) ==1:
            Anodups.append(xs) #has no dups
            tsAnodups.append(ts)
    if (len(Adups)+len(Anodups)) / len(rx) == 1:
        pass
        print("perc w/ dups: " + str(len(Adups)/len(Anodups))) # % that have duplicates (more than one deptfile)
    else:
        print("ERROR0")
        print(len(rx))
        print(len(Adups))
        print(len(Anodups))
             
    # STEP 2.5: get list of files that are associated with duplicates
    Ad_depts = []
    for e in Adups:
        deptlist = e[1]
        Ad_depts.append(deptlist) # list of dup sets
    Ad_depts.sort()
    return yfp5,Adups, tsAdups, Anodups, tsAnodups, Ad_depts,weedout

def resort(yfp5):
    ro = []
    error=[]
    for contents in yfp5:
        email = contents[1]
        fn = contents[0]
        ts=(email[0],email[1])
        new = (ts,fn)
        ro.append(new) # ro = list of ((uts,sender),page)
    ro.sort(key=takeSecond)
    roo=[]
    weedout=[]
    for item in ro:
        no=[]
        email = item[0]
        deptf = item[1]
        utl=email[0]
        sl=email[1]
        num = len(utl) + len(sl) # total number of fields (number of emails x 2)
        for u in utl:
            if u == 'NOTIMESTAMP':
                no.append(u) # no = placeholder field list
        for s in sl:
            if s == 'X':
                no.append(s) # no = placeholder field list 
        if len(no)/num <.25: # if len(no) < 25% of total fields, we're good
            roo.append(item)
        else:
            weedout.append(item) # if len(no) > 25%, there aren't enuf fields to discern duplicates
    if len(ro)==len(roo)+len(weedout):
        print(str(round(len(weedout)/len(roo),2)) + "% insufficient info to detect dups")
    else:
        print("ERROR7")
        
    ndl={}
    for item in roo:
        newdic = {}
        email = item[0] #t?
        deptf = item[1]
        try:
            if email not in [*ndl]:
                newdic[email] = [deptf]
                ndl.update(newdic)
                print(len(ndl),end='\r')
            else:
                ndl[email].append(deptf)
                print(len(ndl),end='\r')
                pass
        except:
            error.append(item)
            #break
    rxo = tolist(ndl)
    return rxo, weedout 
    # rxo = list ((uts,sender),[list of pages with that uts,sender])
    # weedout = list of pages that have too many placeholders to be dup-detectable

def algor_score(Ad_depts,yfp5,esplit,deptlist,typolist,cleanlist,sfun):
    scores1=[]
    for pglist in Ad_depts:
        try:
            # getting scores
            out=[]
            outsetINFO=alg_info(pglist,yfp5)
            outsetDEQ=alg_DEQ(pglist)
            outsetBM=alg_bm(pglist,deptlist)
            outsetTYPO,outsetRIGHT=alg_tyri(pglist,yfp5,typolist,cleanlist)
            outsetCHAR=alg_char(pglist,esplit)
            outsetEDIT=alg_edit(pglist,yfp5,sfun)
        except:
            print("ERR: " + str(pglist))
            continue

        #outx=[]
        out.extend(outsetINFO)
        if outsetDEQ!=[]:
            out.extend(outsetDEQ)
        out.extend(outsetBM)
        out.extend(outsetTYPO)
        out.extend(outsetRIGHT)
        out.extend(outsetCHAR)
        out.extend(outsetEDIT)

        out0=list(dict.fromkeys(out))
        out0.sort()
        scores1.append(out0)#scores and details of what went into score
        ps = str(len(scores1)) + "/" + str(len(Ad_depts))
        print(ps,end="\r")

    scores1.sort()
    #combining scores of each pg
    scores3=[]
    for pglistf in scores1:
        ndl = {}
        for pgs in pglistf:
            newdic = {}
            score = pgs[1]
            pg = pgs[0]
            if pg not in [*ndl]:
                newdic[(pg)] = [score]
                ndl.update(newdic)
            else:
                ndl[(pg)].append(score)
                pass
        scores2 = tolist(ndl) #scores combined for each pg -- (pg, [0,2,3])
        news=[]
        #sum scores of each pg
        for pgs in scores2:
            scorelist = pgs[1]
            pg = pgs[0]
            finscore= sum(scorelist)
            new = (pg,finscore)
            news.append(new)
        news.sort()
        scores3.append(news)
    #taking best score of each pglist
    scores4 =[]
    for pglist in scores3:
        pglist.sort(key=takeSecond)
        pglist2 = revlist(pglist)
        best = pglist2[0]
        outb=[]
        for pg in pglist2:
            score = pg[1]
            deptf = pg[0]
            if pg[0] == best[0]:
                canon = (pg[0],1)
                outb.append(canon)
                outb.sort()
            elif pg[0] != best[0]:
                uncanon = (pg[0],0)
                outb.append(uncanon)
                outb.sort()
        scores4.append(outb) #best score highlighted via binary
    return scores1,scores3,scores4





# alg components

def alg_char(pglist,esplit): #prefers pg with most chars
    outsetCHAR=[]
    c=[]
    for pgs in pglist:
        for bms in esplit:
            chars = len(bms[1])
            fn = bms[0]
            if pgs == fn:
                new = (fn,chars)
                c.append(new)
    if c!=[]:
        c.sort(key=takeSecond)
        c2 = revlist(c)
        high = c2[0]
        hinum = high[1]
        for item in c2:
            perc = item[1]/hinum
            if perc >= 0.9:
                canon = (item[0],4,"char",perc,hinum)
                outsetCHAR.append(canon)
            elif perc > 0.5 and perc < 0.9:
                score = perc*3
                canon = (item[0],score,"char",perc,hinum)
                outsetCHAR.append(canon)
            else:
                noncanon = (item[0],0,"char",perc,hinum)
                outsetCHAR.append(noncanon)
    return outsetCHAR

def alg_tyri(pglist,yfp5,typolist,cleanlist): #prefers hme w/ typo-words not in subj, w/ names in cleanlist
    outsetTYPO=[]
    outsetRIGHT=[]
    rights=[]
    typos=[]
    fin=[]
    for pgs in pglist:
        typo=[]
        right=[]
        nums = []
        for b in yfp5:
            #rights
            deptf=b[0]
            e = b[1]
            if deptf == pgs:
                tsl = e[0]
                sndrl = e[1]
                tol = e[2]
                ccl = e[3]
                subjl = e[4]
                for sndr in sndrl:
                    if sndr in typolist:
                        new=("sndr",sndr)
                        typo.append(new)
                    elif sndr in cleanlist:
                        right.append(sndr)
                for to in tol:
                    if to in typolist:
                        new=("to",to)
                        typo.append(new)
                    elif to in cleanlist:
                        right.append(to)
                for cc in ccl:
                    if cc in typolist:
                        new=("Cc",cc)
                        typo.append(new)
                    elif cc in cleanlist:
                        right.append(cc)
                for subj in subjl:
                    for ty in typolist:
                        t = re.findall(ty,subj)
                        if t!=[] and len(t[0])>4:
                            newp = (t,subj)
                            typo.append(newp)
                        elif t==[]:
                            pass
        newri=(pgs,len(right),right)
        rights.append(newri)
        rights.sort(key=takeSecond)
        bestr=rights[-1]
        maxri = bestr[1]
        rights2=[]
        for item in rights:
            if maxri >0:
                riscore = item[1]
                Zriscore = (item[1]/maxri)
                newri2 = (item[0],Zriscore,str("right: "+ str(item[2])))
                rights2.append(newri2)
            elif maxri==0:
                newri2 = (item[0],0,str("no rights in any"))
                rights2.append(newri2)
                pass
        outsetRIGHT.extend(rights2)
        #typos
        newty=(pgs,len(typo),typo)
        typos.append(newty)
        typos.sort(key=takeSecond)
        bestt=typos[0]
        maxty=bestt[1]
        typos2=[]
        for item in typos:
            if maxty>0:
                tyscore=item[1]
                #Ztyscore=(item[1]/maxty)
                newty2=(item[0],-tyscore,str("typos: " + str(item[2])))
                typos2.append(newty2)
            elif maxty==0:
                newty2=(item[0],0,"no typos")
                typos2.append(newty2)
        outsetTYPO.extend(typos2)
    return outsetTYPO,outsetRIGHT



def alg_bm(pglist,deptlist): #prefers pgs in shorter bms
    outsetBM = []
    goodnum=[]
    newsBM=[]
    refs=[]
    ress=[]
    for dept in deptlist:#["msp","deq","dhhs","executiveofficeemails"]:
        bn1 = "[0-9]*_b[0-9]+_[0-9]+_([0-9]+)_.*txt"
        bn2 = "[0-9]*_b[0-9]+_([0-9]+)_[0-9]+_.*txt"
        ref = str(dept + bn1 + "|")
        refs.extend(ref)
        res = str(dept + bn2 + "|")
        ress.extend(res)
    ress.pop()
    refs.pop()
    resss = ''.join(ress)
    refss = ''.join(refs)
    for pgs in pglist:
        first = re.findall(refss,pgs)
        sec = re.findall(resss,pgs)
        fs=[]
        ss=[]
        for f in first[0]:
            if f!='':
                fs.append(f)
        for s in sec[0]:
            if s!='':
                ss.append(s)
        if fs != [] and ss != []:
            bmsize = int(fs[0])-int(ss[0])
            newBM = (pgs,bmsize)
            newsBM.append(newBM)
        goodnum.append(newBM[1])
    minnum = min(goodnum)
    for newBM in newsBM:
        if newBM[1] == minnum:
            xcanon = (newBM[0],1,"bm") # how many points is BM worth?
            outsetBM.append(xcanon)
        else:
            uncanon = (newBM[0],0,"bm")
            outsetBM.append(uncanon)
    return outsetBM


def alg_DEQ(pglist): #deq rankings (update this...)
    def sortdeq(elem):
        preflist = (14, 15, 16, 17, 18, 19, 20, 21, 24, 25, 26, 27, 28, 13, 12, 11, 10, 9, 4, 3, 2, 1)
        for n in preflist:
            if elem == n:
                rank = preflist.index(n)
                return rank
    deqs=[]
    for pgs in pglist:
        deptdeq=re.findall("deq",pgs)
        if deptdeq!=[]:
            deqs.append(pgs[0])
    if len(deqs)==len(pglist):
        outsetDEQ = []
        deqnums = []
        for pgs in pglist:
            deqnum = re.findall("deq(..).*txt",pgs)
            deqnums.append(int(deqnum[0]))
        deqnums.sort(key=sortdeq)
        nu = deqnums[0]
        pgstr = '\n'.join(pglist)
        r = re.findall("deq0*" + str(nu) + ".*txt",pgstr)
        if r!=[]:
            for rs in r:
                canon = (rs,1,"deq") # how many points is DEQ worth?
                outsetDEQ.append(canon)
            for x in range(0,len(pglist)):
                if pglist[x] not in r:
                    noncanon = (pglist[x],0,"deq")
                    outsetDEQ.append(noncanon)
    else:
        outsetDEQ=[]
    return outsetDEQ





def alg_info(pglist,yfp5): #prefers items w/ least num of empty/placeholder fields
    # INFO #
    out=[]
    outsetINFO=[]
    outINFO=[]
    newsI=[]
    for pgs in pglist:
        info=[]
        nums = []
        for b in yfp5:
            deptf=b[0]
            e = b[1]
            if deptf == pgs:
                tsl = e[0]
                sndrl = e[1]
                tol = e[2]
                ccl = e[3]
                subjl = e[4]
                for ts in tsl:
                    if ts != 'NOTIMESTAMP':
                        info.append(ts)
                for sndr in sndrl:
                    if sndr != 'X' and sndr!=('X',):
                        info.append(sndr)
                for to in tol:
                    if to!=('X',) and to!=():
                        info.append(to)
                for cc in ccl:
                    if cc!= ('NOCc',) and cc!=('X',) and cc!=():
                        info.append(cc)
                for subj in subjl:
                    if len(subj)>2:#and subj!="X":
                        info.append(subj)
        goodnum = len(info)
        newI = (pgs,goodnum)
        newsI.append(newI)
        nums.append(newI[1])
    maxnum = max(nums)
    for newI in newsI:
        if newI[1] == maxnum:
            xcanon = (newI[0],2,"info") # how many points is INFO worth?
            outsetINFO.append(xcanon)
        else:
            uncanon = (newI[0],0,"info")
            outsetINFO.append(uncanon)
    return outsetINFO

                            
def alg_edit(pglist,yfp5,fun):
    out=[]
    outsetEDIT=[]
    outEDIT=[]
    nums=[]
    newEs=[]
    for pg in pglist:
        totnames,changes=go(pg,cleanlist,fun)
        percchgs=len(changes)/len(totnames)
        nums.append(percchgs)
        newE=(pg,percchgs,changes)
        newEs.append(newE)
    maxnum=max(nums)
    minnum=min(nums)
    for newE in newEs:
        if newE[1]==maxnum:
            uncanon = (newE[0],0,"edit",tuple(newE[2]))
            outsetEDIT.append(uncanon)
        elif newE[1]==minnum:
            canon = (newE[0],2,"edit",tuple(newE[2]))
            outsetEDIT.append(canon)
        else:
            uncanon = (newE[0],1,"edit",tuple(newE[2]))
            outsetEDIT.append(uncanon)
    return outsetEDIT
def getNames(emailstext,cleanlist,fun):
    senraw,senfix=fun.findSenders(emailstext,cleanlist,0)
    toraw,tofix=fun.findTo(emailstext,cleanlist,0)
    ccraw,ccfix=fun.findCc(emailstext,cleanlist,0)
    rawnames=senraw+fun.unpack(toraw)+fun.unpack(ccraw)
    fixnames=senfix+fun.unpack(tofix)+fun.unpack(ccfix)
    return rawnames, fixnames
def getChanges(rawnames,fun,cleanlist):
    chngs=[]
    for name in rawnames:
        chng, fixname=fun.edits(name,cleanlist)
        if len(chng)>2:
            chngs.append(chng)
    return chngs
def go(pg,cleanlist,fun):
    changes=[]
    allnames=[]
    etext = emails.getEmail(pg)
    rawnames,fixnames=getNames(etext,cleanlist,fun)
    chngs=getChanges(rawnames,fun,cleanlist)
    changes.extend(chngs)
    allnames.append(rawnames)
    totalnames0=unpack(allnames)
    totalnames=[]
    for name in totalnames0:
        if len(name)>2 or name!="NOCc" or name!="NOCc (On)" or name!="NOTo (On)":
            totalnames.append(name)
    #print(len(changes)/len(totalnames))
    return totalnames, changes


def splitemails(emailstext):
    esplit = re.split('---endPAGE',emailstext)
    esplit2=[]
    for es in esplit:
        regl=[]
        regex="[a-z]+[0-9]+.*txt$"
        fn = re.findall(regex,es)
        if fn ==[] or len(fn)>1:
            print(es)
        else:
            new = (fn[0],es)
            esplit2.append(new)
    return esplit,esplit2


def unpack(x):
    out=[]
    for lis in x:
        out.extend(lis)
    return out

def revlist(deqlist):
    newlist = list(reversed(deqlist))
    return newlist
def takeFirst(elem):
    return elem[0]
def takeSecond(elem):
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

