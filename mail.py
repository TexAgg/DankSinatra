# mail.py
# I couldn't figue out how to send emails with node,
# so I send them with python

#print("Hello")

import smtplib
import sys

def main(argv):
	print 'Number of arguments:', len(sys.argv), 'arguments.'
	print 'Argument List:', str(sys.argv)
	sum = 0
	for item in range(1,len(sys.argv)):
		sum += int(item)
	print sum	
	
	sender = 'mgaikema1@gmail.com'
	receivers = ['mgaikema1@gmail.com']

	#message = """From: Matt Gaikema <mgaikema1@gmail.com>
	#To: Matt Gaikema <mgaikema1@gmail.com>
	#Subject: New message
	#
	#You got mail 
	#"""
	message = "\r\n".join([
  	"From: mgaikema1@gmail.com",
  	"To: mgaikema1@gmail.com",
  	"Subject: Dank update",
  	"",
  	sys.argv[1]
  	])

	try:
		smtpObj = smtplib.SMTP('smtp.gmail.com:587')
		smtpObj.ehlo()
		smtpObj.starttls()
		smtpObj.login('mgaikema1@gmail.com', 'appledog')       
		smtpObj.sendmail(sender, receivers, message)     
		print "Successfully sent email!"
	except Exception:
		print "Error: unable to send email"
	   
main(sys.argv[1:])	   