import re
import os
import json
from itertools import repeat
from modules import uts
from modules import hme
from modules import emailxy
from modules import srec

import nltk
nltk.download('punkt')
from nltk.tokenize import word_tokenize
from nltk.tag import pos_tag
from nltk.chunk import ne_chunk

fileDir = os.path.dirname(os.path.realpath('__file__'))
filename = os.path.join(fileDir, 'txtfiles/cleanlist.txt')
f = open(filename, "r+")
cleanlist0 = f.read()
cleanlist = re.split('\n',cleanlist0)

def getAttDup(emailstext,deptre):
    h = preprocessAD(emailstext,deptre)
    u = getAD(h)
    return u

def preprocessAD(emailstext,deptre):
    import time
    start_time = time.time()
    print("getting no-email bookmarks")
    noe,now,yese = bmstats(emailstext)
    print("tokenizing emails")
    listtokem = []
    for attx in noe:
        tokem =nltk.word_tokenize(attx)
        listtokem.append(tokem)
    print("splitting emails")
    alle = splitemails(emailstext,deptre)
    print("sorting tokenized emails")
    h=[]
    for tok in listtokem:
        g = len(tok)
        d = tok
        newlist=[]
        for toks in tok:
            if toks not in ['--','-endPAGE','--','-']:
                newlist.append(toks)
        if len(newlist)>7:
            new = (d,g)
            h.append(new)
    h.sort(key=takeSec)
    print("%s seconds" % (time.time() - start_time))
    return h

def getAD(h):
    import time
    start_time = time.time()
    a=[]
    for hs in h:
        new = begend(hs)
        a.append(new)
    b=[]
    print("sorting tokenized email groups into probable pairs")
    for hs in a:
        notlist=[]
        listnums=[]
        toks = hs[0]
        num = hs[1]
        for hs1 in a:
            if hs1 != hs:
                notlist.append(hs1)
                listnums.append(hs1[1])
        for hs2 in notlist:
            num1=hs2[1]
            u1 = num1/num
            u2 = num/num1
            if .9 < u1 <= 1 or .9 < u2 <= 1:
                pair = (hs2,hs,u1,u2,num,num1)
                b.append(pair)
                print(len(b),end="\r")
    print("processing tokenized email groups")
    att3,att4,att5 = adsort(b)
    print("incorporating non-dups")
    u = fullList(att5,h)
    print("%s seconds" % (time.time() - start_time))
    return u

# # # # #
    
def exEP(fn):
    x=re.sub("-endPAGE","",fn)
    return x
def fullList(alldups,h):
    alldups2=[]
    for tups in alldups:
        newtup=[]
        for fn in tups:
            fn1 = exEP(fn)
            newtup.append(fn1)
        alldups2.append(tuple(newtup))
    alldups_list=[]
    for tups in alldups2:
        for fn in tups:
            fn1 = exEP(fn)
            alldups_list.append(fn1)
    allfn = []
    for tup in h:
        tokens=tup[0]
        ct=tup[1]
        fn = tokens[-5]
        fn1=exEP(fn)
        allfn.append(fn1)
    notdups=[]
    for rs in allfn:
        if rs not in alldups_list:
            rs1 = exEP(rs)
            rst=(rs1,)
            notdups.append((rst))
    if len(notdups)+len(alldups_list)==len(allfn):
        pass
    else:
        print("ERROR: " + str(len(allfn)) + " vs. " + str(len(notdups)+len(alldups_list)))
    total = list(alldups2 + notdups)
    total.sort(key=takeFirst)
    return total

def adsort(group):
    import time
    start_time = time.time()
    #print("setting pairs")
    #att1 = setpairs(group)
    #print("checking length")
    #att2 = checklgt(att1)
    print("matching by tokens")
    att3 = matchtoks(group)
    att3.sort()
    print("combining")
    att4 = combine(att3)
    att4.sort()
    print("finishing up")
    att5 = smoothout(att4)
    print("%s seconds" % (time.time() - start_time))
    return att3,att4,att5
def splitemails(emailstext,deptre):
    esplit = re.split('BOOKMARKend---',emailstext)
    esplit2=[]
    for es in esplit:
        regex = str(deptre + "[0-9]*_b[0-9]+_[0-9]+_[0-9]+_[0-9]+.txt")
        fn = re.findall(regex,es)
        if fn ==[]:
            pass
        else:
            new = (fn[0],es)
            esplit2.append(new)
    return esplit2
    
    
    
def bmstats(bmpgl_emailstext):
    blankpgs = []
    noemails = []
    yesemails = []
    sa = []
    saa=[]
    listbms = re.split("BOOKMARKend---",bmpgl_emailstext)
    
    for bm in listbms:
        listTS=[]
        listSo=[]
        listTS = uts.getTS(bm)
        listSo = srec.findRawSenders(bm,cleanlist)
        #str1 = str(dept + ".*_X")
        #deptfile = re.findall(str1,bm)
        str2 = str("^\n*\W*[\x0c[a-z][_0-9b]+.txt---endPAGE]+---$")
        nowords = re.findall(str2,bm)
        if nowords != []: # no text
            for noword in nowords:
                sa.append(noword)
                noword = re.sub('\n','',noword)
                #nochar = re.findall("^\s*\x0cdeq[_0-9b]+.txt$",noword)
                #nolett = re.findall("^\W*\x0cdeq[_0-9b]+.txt$",noword)
                for nos in nochar: #no text
                    blankpgs.append(bm)
        elif nowords == []: #there is text
            if listTS == [] and listSo == []: #no email
                noemails.append(bm)
            if listTS != [] or listSo != []: #yes email
                yesemails.append(bm)
        sa.append(listTS)
        saa.append(listSo)
    return noemails,nowords,yesemails#,sa,saa,listbms

def matchtoks(xxa): #if over 80% of tokens match, returns
    no=[]
    dups = []
    dupairfs = []
    
    for paira in xxa:
        match1 = []
        match2 = []
        pa1 = paira[0]
        pa2 = paira[1]
        tok1 = pa1[0]
        tok2 = pa2[0]
        if len(pa1[0]) > 4 and len(pa2[0]) >4:
            deptfa1 = tok1[-5]
            deptfa2 = tok2[-5]
        avg = (len(tok1)+len(tok2))/2
        for wd in tok1:
            if wd in tok2:
                match1.append(wd)
        for wd in tok2:
            if wd in tok1:
                match2.append(wd)
        score = (len(match1)+len(match2))/2
        if score/avg > .8:
            dupairf = [deptfa1,deptfa2]
            dupairfs.append(dupairf)
            dupair = [tuple(pa1),tuple(pa2)]
            #dupspairs.append(dupair)
            dups.extend(paira)
            print(len(dups),end="\r")
        else:
            no.extend(paira)
            pass
    def fwdNbckwd(pairlists):
        reww = []
        for yus in pairlists:
            new = [yus[1],yus[0]]
            reww.append(new)
        newlist = list(reww + pairlists)
        return newlist
    dupairfsx2 = fwdNbckwd(dupairfs)
    fin=[]
    for du in dupairfsx2:
        newlis=[]
        for fn in du:
            fn1=exEP(fn)
            newlis.append(fn1)
        fin.append(newlis)
        
    return fin




def combine(u):
        ndl = {}
        nts = []
        for lists in u:
            f = lists[0]
            s = lists[1]
            newdic = {}
            if f not in [*ndl]:
                newdic[f] = [s]
                ndl.update(newdic)
            else:
                ndl[f].append(s)
                pass
        lndl = tolist(ndl)
        return lndl
def combine1(u):
        ndl = {}
        nts = []
        for lists in u:
            f = lists[0]
            s = lists[1]
            newdic = {}
            if f not in [*ndl]:
                newdic[f] = s
                ndl.update(newdic)
            else:
                ndl[f].append(s)
                pass
        lndl = tolist(ndl)
        lndl.extend(nts)
        return lndl
    
    
    
    
def orderbylen(elem):
    return len(elem)
def elimrepeats(att4): #elims repeats within dup sets, then elims repeat sets
    newu = []
    for listt in att4:
        listt.sort()
        listt2 = list(dict.fromkeys(tuple(listt)))
        newu.append(tuple(listt2))
    newud = list(dict.fromkeys(newu))
    newud.sort()
    #print(str(len(newu)-len(newud)))
    newud.sort(key=orderbylen)
    newud1 = revlist(newud)
    return newud1 # returns list of duplicate sets
def consolidate(newsets):
    allfn=[]
    grandtups=[]
    for tup in newsets:
        newsets1=[]
        grandtup=[]
        for tup1 in newsets:
                if tup != tup1:
                    newsets1.append(tup1)    
        if len(newsets1)==(len(newsets)-1):
            pass
        else:
            print("error")
            break
        for fn in tup:
            afn=[]
            allfn.append(fn)
            for tup1 in newsets1:
                if fn in tup1: #means there is overlap
                    for fn1 in tup1:
                        afn.append(fn1)
            if afn!=[]:
                grandtup.extend(afn)
        if grandtup!=[]:
            grandtups.append(grandtup)
        elif grandtup==[]:
            grandtups.append(tup)
    grandtups.sort(key=orderbylen)
    gt1=[]
    for lis in grandtups:
        dlis=list(dict.fromkeys(lis))
        dlis.sort()
        gt1.append(tuple(dlis))
    dgt1=list(dict.fromkeys(gt1))
    dgt1.sort(key=orderbylen)
    #CHECK:
    newallfn=[]
    dallfn=list(dict.fromkeys(allfn))
    for tups in dgt1:
        for fn in tups:
            newallfn.append(fn)
    if len(newallfn)==len(dallfn):
        print("0 disparity")
    else:
        print("start disparity: " + str(len(allfn)-len(dallfn)))
        print("end disparity: " + str(len(newallfn)-len(dallfn)))
        
    return dgt1
def smoothout(x):
    print("start #: " + str(len(x)))
    newsets = elimrepeats(x)
    print("# after elim internal repeats: " +str(len(newsets)))
    for i in range(0,3):
        newsets = consolidate(newsets)
    print("final #: " + str(len(newsets)))
    return newsets




def tolist(r):
        listr = []
        for key, value in r.items():
            v = []
            v.append(key)
            v.extend(value)
            listr.append(v)
        return listr
    
    
    
def begend(item):
    words=item[0]
    beg = words[0:70]
    end = words[-76:]
    begend = list(beg + end)
    new = (begend,item[1])
    return new

# # # algorithm for canonical att

def sortdeq(elem):
    preflist = (14, 15, 16, 17, 18, 19, 20, 21, 24, 25, 26, 27, 28, 13, 12, 11, 10, 9, 4, 3, 2, 1)
    for n in preflist:
        if elem == n:
            rank = preflist.index(n)
            return rank
def alg_att(u2,listbms):
    final=[]
    outsets=[]
    for aset in u2:
        out=[]
        #CHAR
        outsetCHAR=[]
        fnt=[]
        fntfin=[]
        for fn in aset:
            for bm in listbms:
                fnr = re.findall(fn,bm)
                if fnr!=[]:
                    tokbm = nltk.word_tokenize(bm)
                    numtok = len(tokbm)
            new = (fn, numtok)
            fnt.append(new)
        fnt.sort(key=takeSec)
        fnt2 = revlist(fnt)
        best = fnt2[0]
        bestnum = best[1]
        for f in fnt2:
            if f[1]==bestnum:
                new=(f[0],1,f[1])
                fntfin.append(new)
            else:
                new=(f[0],0,f[1])
                fntfin.append(new)
        #print(len(fntfin),end="\r")
        outsetCHAR.extend(fntfin)
        
        #DEQ#
        deqs=[]
        outsetDEQ = []
        for fn in aset:
            deptdeq=re.findall("deq",fn)
            if deptdeq!=[]:
                deqs.append(fn[0])
        if len(deqs)==len(aset):
            deqnums = []
            for fn in aset:
                deqnum = re.findall("deq(..).*txt",fn)
                if deqnum!=[]:
                    deqnums.append(int(deqnum[0]))
                else:
                    print(aset)
            deqnums.sort(key=sortdeq)
            nu = deqnums[0]
            pgstr = '\n'.join(aset)
            r = re.findall("deq0*" + str(nu) + ".*txt",pgstr)
            if r!=[]:
                for rs in r:
                    canon = (rs,1,"deq") # how many points is DEQ worth?
                    outsetDEQ.append(canon)
                for x in range(0,len(aset)):
                    if aset[x] not in r:
                        noncanon = (aset[x],0,"deq")
                        outsetDEQ.append(noncanon)
        out.extend(outsetCHAR)
        out.extend(outsetDEQ)
        outsets.append(out)
        print(str(len(outsets)),end="\r")
        final.append(outsets)
        
    fine3=[]
    for bmset in outsets:
        ndl = {}
        newdic = {}
        for bm in bmset:
            score = bm[1]
            bm0 = bm[0]
            if bm0 not in [*ndl]:
                newdic[(bm0)] = [score]
                ndl.update(newdic)
            else:
                ndl[(bm0)].append(score)
                pass
        fin2 = srec.tolist(ndl)
        news=[]
        for bms in fin2:
            scorelist = bms[1]
            bm0 = bms[0]
            finscore= sum(scorelist)
            new = (bm0,finscore)
            news.append(new)
        news.sort()
        fine3.append(news)
        print(str(len(fine3)),end="\r")
    return fine3

def takebestscore(fin3):
    final =[]
    for pglist in fin3:
        pglist.sort(key=takeSec)
        pglist2 = revlist(pglist)
        best = pglist2[0]
        out=[]
        for pg in pglist2:
            score = pg[1]
            deptf = pg[0]
            if pg[0] == best[0]:
                canon = (pg[0],1)
                out.append(canon)
                out.sort()
            elif pg[0] != best[0]:
                uncanon = (pg[0],0)
                out.append(uncanon)
                out.sort()
        final.append(out)
        print(str(len(final)),end="\r")
    return final
def alg_wtdscores(Ad_depts,listbms):
    print("running thru algorithm")
    ascores = alg_att(Ad_depts,listbms)
    print("consolidating scores")
    good = takebestscore(ascores)
    return good








import re
def revlist(deptlist):
    newlist = list(reversed(deptlist))
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
def xtolist(r):
        listr = []
        for key, value in r.items():
            k = (key,value)
            listr.append(k)
        return listr