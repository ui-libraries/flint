
# table of contents

# # # fixTS -- input list of TS, outputs unix-friendly list of TS (built into getTS)
# # # getTS -- input emailstext, output list of TS
# # # # nodotzero -- takes .0 off of unix TS (built into getUnixTS)
# # # getUnixTS -- input emailstext, output list of UNIX TS
# # # getUnixTSnd -- getUnixTS, but w/o duplicates
# # # getUnixTSndr -- getUnixTS, but rounds to hundreds place (-2) and outputs list w/o duplicates (TS w/in 100 sec)
# # # # NoUnix -- pulls timestamps that are non-unixable




def fixTS(listofTS): #fix timestamps
    import re
    def daymofix(listofTS):
        def repl(listTS1,regex,day):
            import re
            newlist = []
            for timestamp in listTS1:
                M = re.findall(regex,timestamp)
                if M != "":
                    x = re.sub(regex,day,timestamp)
                    newlist.append(x)        
                else:
                    newlist.append(timestamp)
            return newlist
        def dayall(listofTS):
            m = repl(listofTS,"M[A-Za-z][A-Za-z]+y |IVlbnday ","Monday ")
            t = repl(m,"Tu[A-Za-z:]+..y ","Tuesday ")
            w = repl(t,"W[A-Za-z]+[yY] ","Wednesday ")
            th = repl(w,"Th[A-Za-z]+[yv] ","Thursday ")
            f = repl(th,"[Ff]r[A-Za-z]+[yY] ","Friday ")
            f2 = repl(f,"[Ff][!A-Za-z]+a[yv] ","Friday ")
            f3 = repl(f2,"Fni |Fr[t1]* |Fi1","Fri ")
            sa = repl(f3,"[Ss]a[A-Za-z]+y ","Saturday ")
            su = repl(sa,"[Ss]u[A-Za-z]+y ","Sunday ")
            th2 = repl(su," hursday ","Thursday ")
            return th2
        def moall(listofTS):
            m = repl(listofTS,"Jan[A-Za-z][A-Za-z]+ |lanuary ","Jan ")
            t = repl(m,"[Ft]eb[A-Za-z]+y ","Feb ")
            w = repl(t,"S[A-Za-z]+ber ","Sept ")
            th = repl(w,"Ap[A-Za-z]+ ","Apr ")
            oc = repl(th,"Oc[A-Za-z]+er ","Oct ")
            ju = repl(oc,"Junhe ","June ")
            de = repl(ju,"[N]*Dec.[A-Za-z]+er[n]* ","Dec ")
            return de
        listofTS= dayall(listofTS)
        listofTS= moall(listofTS)
        return listofTS
    
    def timefix(listofTS):
        def timefix1(listofTS): #fix 12: 15 PM
                fin_list = []
                noti_list = []
                for items in listofTS:
                    fdig = re.findall(".*20[120][0-9] [012]*[0-9]: [0-9][0-9][\s]*[AP]M",items)
                    if fdig == []:
                        fin_list.append(items)
                    else:
                        n1 = re.sub(": ",":",fdig[0])
                        fin_list.append(n1)
                return fin_list
        def timefix2(listofTS): #fix  Thursday November 05  2015 10:1839 AM
                fin_list = []
                nosp_list = []
                for items in listofTS:
                    x = re.findall(".*[012]*[0-9]:[0-9][0-9][0-9][0-9][\s]*[AP]M",items)
                    if x == []:
                        fin_list.append(items)
                    else:
                        beg = re.findall("(.*)[012]*[0-9]:[0-9][0-9][0-9][0-9][\s]*[AP]M",x[0])
                        hrmn = re.findall(".*([012]*[0-9]:[0-9][0-9])[0-9][0-9][\s]*[AP]M",x[0])
                        sec = re.findall(".*[012]*[0-9]:[0-9][0-9]([0-9][0-9])[\s]*[AP]M",x[0])
                        end = re.findall(".*[012]*[0-9]:[0-9][0-9][0-9][0-9]([\s]*[AP]M)",x[0])
                        full = str(beg[0] + hrmn[0] + ":" + sec[0] + end[0])
                        fin_list.append(full)
                return fin_list
        def timefix3(listofTS): #fix 3 05 --> 3:05
                fin_list = []
                nosp_list = []
                for items in listofTS:
                    x = re.findall(".*[0-9]*[0-9] [0-9][0-9][\s]*[AP]M",items)
                    if x == []:
                        fin_list.append(items)
                    else:
                        beg = re.findall("(.*)[0-9]*[0-9] [0-9][0-9][\s]*[AP]M",x[0])
                        #yr = re.findall("()[012]*[0-9] [0-9][0-9][\s]*[AP]M",x[0])
                        ti = re.findall(".*([0-9]*[0-9] [0-9][0-9])[\s]*[AP]M",x[0])
                        end = re.findall(".*[0-9]*[0-9] [0-9][0-9]([\s]*[AP]M)",x[0])
                        gti = re.sub(" ",":",ti[0])
                        full = str(beg[0] + gti + end[0])
                        fin_list.append(full)
                return fin_list
        def timefix4(listofTS): # fix 540 AM --> 5:40 AM
                fin_list = []
                nosp_list = []
                for items in listofTS:
                    x = re.findall(".*[0-9]*[0-9][0-9][0-9][\s]*[AP]M",items)
                    if x == []:
                        fin_list.append(items)
                    else:
                        beg = re.findall("(.*)[0-9]*[0-9][0-9][0-9][\s]*[AP]M",x[0])
                        hr = re.findall(".*([0-9]*[0-9])[0-9][0-9][\s]*[AP]M",x[0])
                        mn = re.findall(".*[0-9]*[0-9]([0-9][0-9])[\s]*[AP]M",x[0])
                        end = re.findall(".*[0-9]*[0-9][0-9][0-9]([\s]*[AP]M)",x[0])
                        full = str(beg[0] + hr[0] + ":" + mn[0] + end[0])
                        fin_list.append(full)
                return fin_list
        def timefix5(listofTS): #fix 20156:04 PM --> 2015 6:04 PM
                fin_list = []
                nosp_list = []
                for items in listofTS:
                    x = re.findall(".*20[120][0-9][0-9:]+[\s]*[AP]M",items)
                    if x == []:
                        fin_list.append(items)
                    else:
                        yr = re.findall("20[012][0-9]",x[0])
                        yr_sp = str((yr[0]) + " ")
                        good = re.sub("20[120][0-9]",yr_sp,x[0])
                        fin_list.append(good)
                return fin_list
        listofTS= timefix1(listofTS)
        listofTS= timefix2(listofTS)
        listofTS= timefix3(listofTS)
        listofTS= timefix4(listofTS)
        listofTS= timefix5(listofTS)
        return listofTS

    def fixtime(listofTS,findre,bad,good):
        fin_list = []
        noti_list = []
        for items in listofTS:
            fdig = re.findall(findre,items)
            if fdig == []:
                fin_list.append(items)
            else:
                n1 = re.sub(bad,good,fdig[0])
                fin_list.append(n1)
        return fin_list
   
    listofTS= daymofix(listofTS)
    listofTS= timefix(listofTS)
    listofTS= fixtime(listofTS,".* 26[10][0-9] .*","26","20")
    listofTS= fixtime(listofTS,".* 70[10][0-9] .*","70","20")
    listofTS= fixtime(listofTS,".* 207[0-9] .*","207","201")
    listofTS= fixtime(listofTS,".* 202[0-9] .*","202","201")
    listofTS= fixtime(listofTS,".*20[10][0-9] [012]*[0-9] :[0-9][0-9][\s]*[AP]M"," :",":")
    listofTS= fixtime(listofTS,".*20[10][0-9] [012]*[0-9]: [0-9][0-9][\s]*[AP]M",": ",":")
    listofTS= fixtime(listofTS,".*20[10][0-9] [012]*[0-9]:[0-9][0-9]:[\s]*[AP]M",": ","")
    listofTS= fixtime(listofTS,".*20[10][0-9] [012]*[0-9]:[0-9][0-9]: [0-9[0-9][\s]*[AP]M",": ",":")
    listofTS= fixtime(listofTS,".*at [01]*[0-9] :[0-9][0-9][\s]*[AP]M"," :",":")
    listofTS= fixtime(listofTS,".*at [01]*[0-9]: [0-9][0-9][\s]*[AP]M",": ",":")
    listofTS= fixtime(listofTS,".*at [01]*[0-9]: [0-9][0-9].*[\s]*[AP]M",": ",":")
    listofTS= fixtime(listofTS,".*at [01]*[0-9]:[0-9][0-9]:[\s]*[AP]M",": ","")
    listofTS= fixtime(listofTS, ".*: .*",": ","")
    listofTS= fixtime(listofTS, ".*::.*","::",":")
    listofTS= fixtime(listofTS, ".* r .*","r","at")
    listofTS= fixtime(listofTS, ".* L Fri.*","L","")
    return listofTS


def getTS(emailstext):
    import datetime
    import dateutil.parser
    import re
    dtr1 = {"Sent:":"S[ae]nt[:;](.*[AP][M])","Date:":"Date[:;](.*[AP][M])","On1":"On ([A-Z].*[APap][Mm]).* wro[tf]e"}
    dtr2 = {"Sent:":"\n\W*[Ss][ae]nt[:;]*(.*)","Date:":"Date[:;](.*)","On1":"On ([A-Z].*[APap][Mm]).* wro[tf]e:","On2":"On ([A-Z].*2[01][0-9][0-9]).* wro[tf]e"}

    def preprocess(x):
        x = x.replace('\t',' ')
        #x = x.replace('\n',' ')
        x = x.replace('(',' ')
        x = x.replace(')',' ')
        x = x.replace('[',' ')
        x = x.replace(']',' ')
        x = x.replace('{',' ')
        x = x.replace('}',' ')
        x = x.replace(',',' ')
        x = x.replace('"','')
        x = x.replace("'",'')
        x = x.replace("_","")
        x = x.replace("- ","")
        x = x.replace("|","")
        x = x.replace("~","")
        x = x.replace(".","")
        x = x.replace("+ ","")
        x = x.replace("=","")
        x = x.replace("C ","")
        x = x.replace("o ","")
        x = x.replace(";",":")
        x = x.replace("; ","")
        x = x.replace("`","")
        x = x.replace("y:","y")
        x = x.replace("?","2")
        x = x.replace("‘","")
        x = x.replace("é","e")
        x = x.replace("ﬁ","at")
        return(x)


    reg1 = '|'.join(dtr2.values())
    

    def DateTimeExtractor(reg,x):
        x = preprocess(x)
        DT = re.findall(reg,x)
        return(DT)

    def toUnixTime(time_list):
        new_list = []
        for t in time_list:
            try:
                unixtime = dateutil.parser.parse(t).timestamp()
                new_list.append(unixtime)
            except Exception:
                pass  
        return new_list
    
    setTS1 = DateTimeExtractor(reg1,emailstext)

    def putinlist(setTS):
        listTS = []
        for trio in setTS:
            if trio == ('','','',''):
                listTS.append("NOTIMESTAMP")
            for timestamp in trio:
                if timestamp == '':
                    pass
                else:
                    k = timestamp.replace(" :","")
                    k1 = re.sub("AM.*","AM",k)
                    k2 = re.sub("PM.*","PM",k1)
                    listTS.append(k2)
        return listTS
    
    listTS1 = putinlist(setTS1)
    flistTS1 = fixTS(listTS1)
    return flistTS1

def nodotzero(listofunixts):
    import re
    newunix = []
    for unixts0 in listofunixts:
        ut = str(unixts0)
        h = re.sub("\.0","",ut)
        newunix.append(h)
    return newunix


def getUnixTS(emailstext):
    import re
    import datetime
    import dateutil.parser
    def toUnixTime(time_list):
        new_list = []
        for t in time_list:
            try:
                unixtime = dateutil.parser.parse(t).timestamp()
                new_list.append(unixtime) 
            except Exception:
                pass
        return new_list
    
    listTS = getTS(emailstext)
    unixtimes = []
    unixtimes2 = []
    for TS in listTS:
        if TS == 'NOTIMESTAMP':
            unixtimes.append(TS)
        else:
            unixtime = toUnixTime([TS])
            unixtimes.extend((unixtime))
            
    #unixtimes = toUnixTime(listTS)
    unixtimes1 = nodotzero(unixtimes)
    return unixtimes1

def getUnixTSr(emailstext): #rounds, so that timestamps within 100 secs of each other are the same
    import re
    import datetime
    import dateutil.parser
    utnd = getUnixTS(emailstext)
    rtnd = []
    for uts in utnd:
        if uts == "NOTIMESTAMP":
            rtnd.append(uts)
        elif uts == 1440979200:
            pass
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