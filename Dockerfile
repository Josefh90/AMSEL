FROM kalilinux/kali-rolling

RUN apt-get update && apt-get install -y --no-install-recommends hydra && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

CMD ["/bin/bash"]


#docker pull peakkk/metasploitable
#docker run -d --name metasploitable -p 2222:22 -p 2121:21 -p 8080:80 peakkk/metasploitable