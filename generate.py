import requests
import csv

def register(data):
    url = 'http://localhost:2000/book'
    myobj = {'name':'Book 1','author':'Author 1','AccNo':'1'}

    x = requests.post(url, data = data)

    #print(x.text)


with open('books.csv') as file:
    read=csv.reader(file,delimiter=',')
    curr=1
    for row in read:
        data={'name':row[0],'author':row[1],'AccNo':'20'+str(curr),'category':row[2],'publisher':row[4]}
        curr+=1;
        print(data)
        register(data)
        print("registered book"+str(curr) )
        
        
        





