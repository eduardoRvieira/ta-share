package com.grupo5.ta_share.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

  // Trata erros quando algo não é encontrado (Ex: ID inválido)
  @ExceptionHandler(RuntimeException.class)
  public ResponseEntity<Object> handleRuntimeException(RuntimeException ex) {
    Map<String, Object> body = new HashMap<>();
    body.put("timestamp", LocalDateTime.now());
    body.put("status", HttpStatus.BAD_REQUEST.value());
    body.put("error", "Erro na Requisição / Regra de Negócio");
    body.put("message", ex.getMessage());

    return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
  }

  // Trata qualquer outro erro inesperado do servidor
  @ExceptionHandler(Exception.class)
  public ResponseEntity<Object> handleGenericException(Exception ex) {
    Map<String, Object> body = new HashMap<>();
    body.put("timestamp", LocalDateTime.now());
    body.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
    body.put("error", "Erro interno no servidor");
    body.put("message", ex.getMessage());

    return new ResponseEntity<>(body, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

