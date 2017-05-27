This example is available at page
[https://examples.nextrtc.org/](https://examples.nextrtc.org/)

Clone project and then
* enter to directory with project
* run: ```mvn clean install && java -jar target/videochat.war```

enter to directory ```src/main/resources```
and generate self signed certificate (in repository certificate might be expired):
```bash
keytool -genkey -alias tomcat -keyalg RSA  -keystore keystore.jks
```

```
Enter keystore password: password
Re-enter new password: password
What is your first and last name?
  [Unknown]:  127.0.0.1
What is the name of your organizational unit?
  [Unknown]:  Develepment
What is the name of your organization?
  [Unknown]:  NextRTC
What is the name of your City or Locality?
  [Unknown]:  Cracow
What is the name of your State or Province?
  [Unknown]:  Malopolskie
What is the two-letter country code for this unit?
  [Unknown]:  PL
Is CN=127.0.0.1, OU=Develepment, O=NextRTC, L=Cracow, ST=Malopolskie, C=PL corre
ct?
  [no]:  yes

Enter key password for <tomcat>
  (RETURN if same as keystore password): <RETURN>
```

then:
* run: ```mvn clean install && java -jar target/videochat.war ```
* enter [https://localhost:8433](https://localhost:8433) in your favourite browser
(**HTTPS is important, because default http handler isn't configured**)
* accept untrusted certificate

_Sometimes websocket (js side) is throwing exception then try to change localhost to 127.0.0.1_
